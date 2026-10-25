"use client";

import { T, useLanguage } from "@/components/LanguageProvider";
import { useState } from "react";
import { CARD_AMOUNTS } from "@/lib/catalog";
import { CRYPTO_LINKS, receptionUrl } from "@/lib/crypto-links";
import CatalogCardPreview from "./CatalogCardPreview";

const PRESETS = CARD_AMOUNTS;

export default function AmountForm({ brand, initialAmount = 100, initialQuantity = 1 }) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState(initialAmount);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [custom, setCustom] = useState("");
  const [f, setF] = useState({ buyerName: "", buyerEmail: "", recipientName: "", recipientEmail: "", message: "", website: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const value = custom !== "" ? Number(custom) : amount;
  const valid = Number.isInteger(value) && value >= 20 && value <= 500;

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!valid) return setError("Le montant doit être un nombre entier entre 20 € et 500 €.");
    setLoading(true);
    try {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, brand, amount: value, quantity }) });
      const d = await r.json();
      if (!r.ok || !d.url) throw new Error(d.error || "Une erreur est survenue.");
      window.location.href = d.url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-2">
      <div className="lg:sticky lg:top-24">
        <CatalogCardPreview brand={brand} amount={valid ? value : NaN} sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), (max-width: 1151px) calc((100vw - 88px) / 2), 532px" />
        <p className="mt-4 text-sm text-stone-600"><T>Livraison instantanée par e-mail après confirmation du paiement.</T></p>
      </div>

      <form onSubmit={submit} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-8">
        <fieldset>
          <legend className="label"><T>Choisissez le montant</T></legend>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {PRESETS.map((p) => (
              <button type="button" key={p} onClick={() => { setAmount(p); setCustom(""); }}
                className={`rounded-xl border px-3 py-3 font-semibold transition ${custom === "" && amount === p ? "border-brand-600 bg-brand-600 text-white" : "border-stone-300 hover:border-brand-500"}`}>
                {p} €
              </button>
            ))}
          </div>
          <div className="mt-3">
            <label className="label" htmlFor="custom"><T>Ou saisissez un montant (20 – 500 €)</T></label>
            <input id="custom" type="number" min="20" max="500" step="1" inputMode="numeric" className="input" placeholder={t("Ex. 250")} value={custom} onChange={(e) => setCustom(e.target.value)} />
          </div>
        </fieldset>

        <div>
          <label className="label" htmlFor="quantity"><T>Quantité de cartes</T></label>
          <select id="quantity" className="input" value={quantity} onChange={(e) => setQuantity(Number(e.target.value))}>{Array.from({ length: 20 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}</select>
          <p className="mt-3 font-semibold" aria-live="polite">{valid ? `${quantity} × ${value.toLocaleString("fr-FR")} € = ${(value * quantity).toLocaleString("fr-FR")} €` : t("Choisissez un montant valide.")}</p>
          <p className="mt-1 text-sm text-stone-600"><T>Un code distinct par carte, envoyé aux adresses indiquées ci-dessous.</T></p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="label" htmlFor="bn"><T>Votre nom</T></label><input id="bn" className="input" value={f.buyerName} onChange={set("buyerName")} maxLength={100} /></div>
          <div><label className="label" htmlFor="be"><T>Votre e-mail *</T></label><input id="be" type="email" required className="input" value={f.buyerEmail} onChange={set("buyerEmail")} /></div>
          <div><label className="label" htmlFor="rn"><T>Nom du destinataire</T></label><input id="rn" className="input" value={f.recipientName} onChange={set("recipientName")} maxLength={100} /></div>
          <div><label className="label" htmlFor="re"><T>E-mail du destinataire</T></label><input id="re" type="email" className="input" value={f.recipientEmail} onChange={set("recipientEmail")} /></div>
        </div>
        <div>
          <label className="label" htmlFor="msg"><T>Message personnel (facultatif)</T></label>
          <textarea id="msg" rows={3} maxLength={300} className="input" value={f.message} onChange={set("message")} />
        </div>
        {/* Honeypot anti-bots */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" value={f.website} onChange={set("website")} aria-hidden="true" />

        <div className="rounded-xl border border-brand-100 bg-brand-50 p-4">
          <div className="mb-4 grid grid-cols-3 gap-2" aria-label={t("Liens de réception crypto")}>
            {CRYPTO_LINKS.map(({ currency, name, url }) => {
              const href = receptionUrl(url);
              const style = "flex min-h-12 items-center justify-center rounded-xl border px-3 py-3 font-bold transition";
              return href ? (
                <a key={currency} href={href} target="_blank" rel="noopener noreferrer" aria-label={`${name} (${currency})`} className={`${style} border-brand-600 bg-white text-brand-900 hover:bg-brand-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600`}>
                  {currency}
                </a>
              ) : (
                <button key={currency} type="button" disabled title={t("Lien de réception à configurer")} aria-label={`${name} (${currency}) — ${t("Lien de réception à configurer")}`} className={`${style} cursor-not-allowed border-stone-200 bg-stone-100 text-stone-400`}>
                  {currency}
                </button>
              );
            })}
          </div>
          <p className="font-semibold text-brand-900"><T>Paiement Bitcoin (BTC)</T></p>
          <p id="payment-availability" className="mt-1 text-sm text-stone-600">
            <T>Le montant en BTC et l’adresse de paiement seront affichés à l’étape suivante. Réseau Bitcoin uniquement.</T>
          </p>
        </div>
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700"><T>{error}</T></p>}
        <button className="btn-primary w-full text-lg disabled:cursor-not-allowed" disabled={loading} aria-describedby="payment-availability">
          {loading ? t("Redirection vers le paiement…") : t("Payer {total} en Bitcoin", { total: valid ? (value * quantity).toLocaleString("fr-FR") + " €" : "" })}
        </button>
        <p className="text-center text-xs text-stone-500"><T>Le code est envoyé après vérification du dépôt Bitcoin par notre équipe.</T></p>
      </form>
    </div>
  );
}
