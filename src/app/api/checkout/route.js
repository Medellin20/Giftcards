import { CARD_BRANDS } from "@/lib/catalog";
import { bitcoinAddress, bitcoinQuote } from "@/lib/payment";
import { NextResponse } from "next/server";
import { db } from "@/lib/supabase";
import { rateLimit, clientIp } from "@/lib/rateLimit";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (s, n) => String(s || "").trim().slice(0, n);
const err = (m, status = 400) => NextResponse.json({ error: m }, { status });

export async function POST(req) {
  const address = bitcoinAddress();
  if (!address) return err("Paiement Bitcoin en cours de configuration.", 503);
  if (!rateLimit("checkout:" + clientIp(req), 10, 10 * 60_000)) return err("Trop de tentatives, réessayez plus tard.", 429);
  let b;
  try { b = await req.json(); } catch { return err("Requête invalide"); }
  if (b.website) return err("Requête invalide"); // honeypot anti-bots

  const brand = b.brand;
  if (!CARD_BRANDS.includes(brand)) return err("Veuillez choisir une carte du catalogue.");
  const amount = Number(b.amount);
  if (!Number.isInteger(amount) || amount < 20 || amount > 500) return err("Montant invalide (20 € à 500 €).");
  const quantity = b.quantity === undefined ? 1 : Number(b.quantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return err("Quantité invalide (1 à 20 cartes).");
  const buyerEmail = clean(b.buyerEmail, 200);
  const recipientEmail = clean(b.recipientEmail, 200);
  if (!EMAIL.test(buyerEmail)) return err("Adresse e-mail invalide.");
  if (recipientEmail && !EMAIL.test(recipientEmail)) return err("E-mail du destinataire invalide.");

  let quote;
  try { quote = await bitcoinQuote(amount * quantity * 100); }
  catch { return err("Paiement momentanément indisponible.", 502); }
  const supa = db();
  const { data: order, error } = await supa.from("orders").insert({
    ...quote,
    bitcoin_address: address,
    payment_method: "bitcoin",
    brand,
    quantity,
    amount_cents: amount * quantity * 100,
    buyer_name: clean(b.buyerName, 100) || null,
    buyer_email: buyerEmail,
    recipient_name: clean(b.recipientName, 100) || null,
    recipient_email: recipientEmail || null,
    message: clean(b.message, 300) || null,
  }).select("id").single();
  if (error) return err("Erreur serveur", 500);

  return NextResponse.json({ url: `/merci?order=${order.id}` });
}
