import "server-only";

export function bitcoinAddress() {
  const address = (process.env.BITCOIN_ADDRESS || "").trim();
  // Accept native Bitcoin mainnet address formats only, never EVM/Lightning addresses.
  return /^(bc1[a-z0-9]{39,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/.test(address) ? address : null;
}

export async function bitcoinQuote(amountCents) {
  const response = await fetch("https://api.coinbase.com/v2/prices/BTC-EUR/spot", { cache: "no-store", signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error("rate unavailable");
  const { data } = await response.json();
  const rate = Number(data?.amount);
  if (data?.base !== "BTC" || data?.currency !== "EUR" || !Number.isFinite(rate) || rate <= 0) throw new Error("invalid rate");
  return { bitcoin_sats: Math.ceil(amountCents * 1000000 / rate), bitcoin_rate_eur: rate, bitcoin_expires_at: new Date(Date.now() + 30 * 60000).toISOString() };
}
