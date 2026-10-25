// Adresses de réception par devise et réseau.
// Conserver le réseau correspondant à chaque adresse.
export const CRYPTO_LINKS = [
  { currency: "BTC", name: "Bitcoin", network: "Bitcoin", decimals: 8, url: "bc1qanmtx3fky28388v05zyusmj9hk8w09p27hzg2e" },
  { currency: "ETH", name: "Ethereum", network: "Ethereum (ERC20)", decimals: 8, url: "0xD1df747500bCA190A10856A1C3658F381d4EE4c3" },
  { currency: "USDT", name: "Tether", network: "TON", decimals: 6, url: "UQAcxh6ef8SHgBDR5tEzZ1giCmHQExw9JD3lWKy-Qtj8P4wN" },
];

export function cryptoPayment(currency) {
  return CRYPTO_LINKS.find((item) => item.currency === currency) || null;
}
