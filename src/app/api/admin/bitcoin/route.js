import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/supabase";
import { fulfillOrder } from "@/lib/fulfill";

export async function POST(req) {
  if (!(await getSession())) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if (req.headers.get("origin") !== new URL(req.url).origin) return NextResponse.json({ error: "Origine invalide" }, { status: 403 });
  const form = await req.formData();
  const id = String(form.get("id") || "");
  const txid = String(form.get("txid") || "").trim().toLowerCase();
  if (!/^[0-9a-f-]{36}$/i.test(id) || !/^[0-9a-f]{64}$/.test(txid) || form.get("verified") !== "on")
    return NextResponse.json({ error: "Vérifiez le dépôt et renseignez son TXID (64 caractères hexadécimaux)." }, { status: 400 });
  const { data, error } = await db().from("orders").update({ status: "paid", paid_at: new Date().toISOString(), bitcoin_txid: txid })
    .eq("id", id).eq("payment_method", "bitcoin").eq("status", "pending").select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Confirmation impossible : commande déjà traitée ou TXID déjà utilisé." }, { status: 409 });
  await fulfillOrder(id);
  return NextResponse.redirect(new URL("/admin", req.url), 303);
}
