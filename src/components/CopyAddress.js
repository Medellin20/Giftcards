"use client";

import { useRef, useState } from "react";
import { T, useLanguage } from "./LanguageProvider";

export default function CopyAddress({ address }) {
  const { t } = useLanguage();
  const field = useRef(null);
  const [status, setStatus] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setStatus("copied");
    } catch {
      // Keep the address selectable when clipboard access is unavailable.
      field.current?.focus();
      field.current?.select();
      setStatus("manual");
    }
  }

  return (
    <div>
      <label htmlFor="payment-address" className="mb-3 block text-sm font-semibold text-brand-900"><T>Adresse de réception</T></label>
      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-3 sm:p-4">
        <textarea ref={field} id="payment-address" readOnly value={address} rows={2}
          onFocus={(event) => event.target.select()}
          className="block w-full resize-none break-all border-0 bg-transparent p-1 font-mono text-sm leading-6 text-brand-900 outline-none focus-visible:ring-2 focus-visible:ring-brand-500" />
        <button type="button" onClick={copy} className="btn-primary mt-3 min-h-11 w-full gap-2 rounded-xl text-sm">
          <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            {status === "copied" ? <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" /> : <><rect x="8" y="8" width="12" height="12" rx="3" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></>}
          </svg>
          {t(status === "copied" ? "Adresse copiée !" : "Copier l’adresse")}
        </button>
      </div>
      <p role="status" aria-live="polite" className={`mt-2 text-xs ${status === "manual" ? "text-amber-800" : "text-brand-600"}`}>
        {status === "copied" ? t("Adresse copiée !") : status === "manual" ? t("Copie automatique indisponible. Copiez l’adresse sélectionnée.") : ""}
      </p>
    </div>
  );
}
