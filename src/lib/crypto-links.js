// Renseignez ici vos liens de réception HTTPS, entre les guillemets.
// Un lien vide laisse le bouton correspondant désactivé.
export const CRYPTO_LINKS = [
  { currency: "BTC", name: "Bitcoin", url: "bc1qanmtx3fky28388v05zyusmj9hk8w09p27hzg2e" },
  { currency: "ETH", name: "Ethereum", url: "0xD1df747500bCA190A10856A1C3658F381d4EE4c3" },
  { currency: "USDT", name: "Tether", url: "UQAcxh6ef8SHgBDR5tEzZ1giCmHQExw9JD3lWKy-Qtj8P4wN" },
];

export function receptionUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}
