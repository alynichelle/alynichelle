import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { supabaseServer } from "../lib/supabaseServer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
    const { client_id, amount_cents, reason } = req.body || {};
    if (!client_id || !amount_cents) return res.status(400).json({ error: "client_id & amount_cents required" });
    const { data: client } = await supabaseServer
      .from("clients")
      .select("stripe_customer_id, default_payment_method_id")
      .eq("id", client_id)
      .single();
    if (!client?.stripe_customer_id || !client?.default_payment_method_id) {
      return res.status(400).json({ error: "No card on file" });
    }
    const pi = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: "usd",
      customer: client.stripe_customer_id,
      payment_method: client.default_payment_method_id,
      confirm: true,
      off_session: true,
      description: reason || "Charge on file",
    });
    return res.status(200).json({ payment_intent: pi.id, status: pi.status });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
