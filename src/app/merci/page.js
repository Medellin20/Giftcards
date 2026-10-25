import { T } from "@/components/LanguageProvider";
import Link from "next/link";
import { fulfillOrder } from "@/lib/fulfill";
import { maskEmail } from "@/lib/format";
import Refresher from "@/components/Refresher";
import PaymentDetails from "@/components/PaymentDetails";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confirmation — Cartes cadeaux", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

export default async function Merci({ searchParams }) {
  const id = searchParams?.order;
  let r = { status: "not_found" };
  if (id && UUID.test(id)) { try { r = await fulfillOrder(id); } catch { r = { status: "pending" }; } }

  const views = {
    paid: { icon: "✅", title: "Paiement confirmé", text: r.emailed
      ? <T values={{ email: maskEmail(r.order?.buyer_email) }} translatedValues={{ recipient: r.order?.recipient_email ? " et au destinataire" : "" }}>{r.order?.quantity > 1
          ? "Vos cartes cadeaux ont été envoyées à {email}{recipient}. Pensez à vérifier vos courriers indésirables."
          : "Votre carte cadeau a été envoyée à {email}{recipient}. Pensez à vérifier vos courriers indésirables."}</T>
      : "Votre paiement est bien confirmé. L’envoi de l’e-mail rencontre un retard ; vous le recevrez très bientôt (sinon, contactez-nous)." },
    pending: { icon: "⏳", title: "Vérification du paiement…", text: "Nous attendons la vérification du paiement par notre équipe. Cette page s’actualise automatiquement." },
    failed: { icon: "❌", title: "Paiement refusé", text: "Le paiement n’a pas abouti. Aucun montant n’a été débité. Vous pouvez réessayer." },
    mismatch: { icon: "⚠️", title: "Vérification requise", text: "Une incohérence a été détectée sur ce paiement. Contactez-nous en indiquant votre numéro de commande." },
    not_found: { icon: "❓", title: "Commande introuvable", text: "Nous ne retrouvons pas cette commande." },
  };
  const v = views[r.status] || views.not_found;

  return (
    <section className="mx-auto w-full max-w-xl px-4 py-12 text-center sm:px-6 sm:py-16">
      {r.status === "pending" && <Refresher />}
      <div aria-hidden="true" className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-3xl ring-1 ring-brand-100">{v.icon}</div>
      <h1 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl text-brand-900"><T>{v.title}</T></h1>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-stone-500"><T>{v.text}</T></p>
      {r.status === "pending" && r.order?.payment_method === "crypto" && (
        <PaymentDetails currency={r.order.crypto_currency} network={r.order.crypto_network}
          amount={r.order.crypto_amount} address={r.order.crypto_address} expiresAt={r.order.crypto_expires_at} />
      )}
      {r.status === "pending" && r.order?.payment_method === "bitcoin" && (
        <PaymentDetails currency="BTC" network="Bitcoin (BTC)"
          amount={(r.order.bitcoin_sats / 100000000).toFixed(8)} address={r.order.bitcoin_address}
          expiresAt={r.order.bitcoin_expires_at}
          walletUrl={`bitcoin:${r.order.bitcoin_address}?amount=${(r.order.bitcoin_sats / 100000000).toFixed(8)}`} />
      )}
      {id && <p className="mt-6 break-all text-xs leading-relaxed text-stone-400"><T>Commande :</T>{" "}{id}</p>}
      <Link href="/" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"><T>Retour à l’accueil</T></Link>
    </section>
  );
}
