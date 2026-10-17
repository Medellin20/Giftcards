import "server-only";
import { db } from "./supabase";
import { generateCode } from "./codes";
import { sendGiftCardEmail } from "./email";

// Cards are issued only after an authenticated administrator confirms the deposit.
export async function fulfillOrder(orderId) {
  const supa = db();
  let { data: order } = await supa.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!order) return { status: "not_found" };

  if (order.status === "pending") return { status: "pending", order };

  if (order.status !== "paid") return { status: order.status };

  // Une position unique par carte garantit des émissions idempotentes, même en concurrence.
  const quantity = order.quantity || 1;
  let { data: cards, error: cardsError } = await supa.from("gift_cards").select("*").eq("order_id", order.id);
  if (cardsError) return { status: "paid", emailed: false, order };
  const missing = Array.from({ length: quantity }, (_, i) => i + 1)
    .filter((position) => !cards.some((card) => card.position === position));
  if (missing.length) {
    await supa.from("gift_cards").upsert(missing.map((position) => ({
      code: generateCode(), order_id: order.id, position,
      initial_cents: order.amount_cents / quantity, balance_cents: order.amount_cents / quantity,
    })), { onConflict: "order_id,position", ignoreDuplicates: true });
    ({ data: cards, error: cardsError } = await supa.from("gift_cards").select("*").eq("order_id", order.id));
    if (cardsError || cards?.length !== quantity) return { status: "paid", emailed: false, order };
  }

  // E-mail : on "réserve" l'envoi, et on le libère en cas d'échec pour permettre un nouvel essai
  const { data: claim } = await supa.from("orders")
    .update({ email_sent_at: new Date().toISOString() })
    .eq("id", order.id).is("email_sent_at", null).select("id").maybeSingle();
  if (claim) {
    try {
      const to = [...new Set([order.buyer_email, order.recipient_email].filter(Boolean))];
      await sendGiftCardEmail({
        to, codes: cards.sort((a, b) => a.position - b.position).map((card) => card.code), amountCents: order.amount_cents / quantity,
        recipientName: order.recipient_name, senderName: order.buyer_name, message: order.message,
      });
    } catch (e) {
      await supa.from("orders").update({ email_sent_at: null }).eq("id", order.id);
      return { status: "paid", emailed: false, order };
    }
  }
  return { status: "paid", emailed: true, order };
}
