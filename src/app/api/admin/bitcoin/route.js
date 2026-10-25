import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { fulfillOrder } from "@/lib/fulfill";

export async function POST(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (req.headers.get("origin") !== new URL(req.url).origin) return NextResponse.json({ error: "Origine invalide" }, { status: 403 });
  const form = await req.formData();
  const id = String(form.get("id") || "");
  const txid = String(form.get("txid") || "").trim().replace(/^0x/i, "").toLowerCase();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f]{64}$/.test(txid) || form.get("verified") !== "on")
    return NextResponse.json({ error: "Vérifiez le dépôt et renseignez son TXID (64 caractères hexadécimaux)." }, { status: 400 });
  const supa = db();
  const { data: order } = await supa.from("orders").select("payment_method").eq("id", id).maybeSingle();
  if (!["bitcoin", "crypto"].includes(order?.payment_method)) return NextResponse.json({ error: "Commande invalide" }, { status: 400 });
  // Preserve the legacy Bitcoin workflow and transaction uniqueness across both formats.
  for (const column of ["bitcoin_txid", "crypto_txid"]) {
    const { data: used, error: lookupError } = await supa.from("orders").select("id").eq(column, txid).maybeSingle();
    if (lookupError || used) return NextResponse.json({ error: "Vérification impossible ou TXID déjà utilisé." }, { status: 409 });
  }
  const { data, error } = await supa.from("orders").update({ status: "paid", paid_at: new Date().toISOString(), bitcoin_txid: txid, ...(order.payment_method === "crypto" ? { crypto_txid: txid } : {}) })
    .eq("id", id).eq("payment_method", order.payment_method).eq("status", "pending").select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Confirmation impossible : commande déjà traitée ou TXID déjà utilisé." }, { status: 409 });
  await fulfillOrder(id);
  return NextResponse.redirect(new URL("/admin", req.url), 303);
}
