import { T } from "./LanguageProvider";
import CopyAddress from "./CopyAddress";

export default function PaymentDetails({ currency, network, amount, address, expiresAt, walletUrl }) {
  const active = new Date(expiresAt).getTime() > Date.now();
  const symbol = { BTC: "₿", ETH: "Ξ", USDT: "₮" }[currency] || currency;

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-brand-100 bg-white text-left shadow-xl shadow-brand-900/10">
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-900 via-brand-700 to-brand-600 p-6 text-white sm:p-8">
        <div aria-hidden="true" className="absolute -right-10 -top-16 h-52 w-52 rounded-full border-[24px] border-white/5" />
        <div className="relative flex items-center gap-4">
          <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-3xl font-bold text-accent-400">{symbol}</span>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-100"><T>Votre paiement</T></p>
            <h2 className="mt-1 text-2xl font-extrabold"><T values={{ currency }}>{"Paiement en {currency}"}</T></h2>
          </div>
        </div>
        <div className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium">
          <span aria-hidden="true" className={`h-2 w-2 rounded-full ${active ? "bg-accent-400" : "bg-stone-300"}`} />
          <T>{active ? "En attente du paiement" : "Délai expiré"}</T>
        </div>
      </div>
      <div className="space-y-6 p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-5 text-sm">
          <span className="text-stone-500"><T>Réseau de paiement</T></span>
          <span className="rounded-lg bg-brand-50 px-3 py-1.5 font-semibold text-brand-900">{network}</span>
        </div>
        {active ? <>
          <div>
            <p className="text-sm text-stone-500"><T>Montant exact à recevoir :</T></p>
            <p className="mt-2 flex flex-wrap items-baseline gap-x-2 font-extrabold tracking-tight text-brand-900">
              <span className="break-all text-3xl sm:text-4xl">{amount}</span><span className="text-lg text-brand-500">{currency}</span>
            </p>
          </div>
          <CopyAddress address={address} />
          {walletUrl && <a className="btn-dark w-full text-sm" href={walletUrl}><T>Ouvrir mon portefeuille Bitcoin</T></a>}
          <div className="flex gap-3 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
            <svg className="mt-0.5 shrink-0" aria-hidden="true" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M12 7v6m0 3v1" /></svg>
            <p><T>Utilisez uniquement le réseau indiqué. Envoyez le montant exact sous 30 minutes. Les frais de réseau sont à votre charge.</T></p>
          </div>
        </> : <p role="status" className="rounded-2xl bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"><T>Le délai de paiement est expiré. Si vous avez déjà payé, attendez la vérification. Sinon, créez une nouvelle commande.</T></p>}
      </div>
    </div>
  );
}
