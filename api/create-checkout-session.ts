import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20" });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
    const { amount_cents = 3000, name = "Lash Service", success_url, cancel_url, booking_id } = req.body || {};

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: booking_id || undefined,
      metadata: booking_id ? { booking_id } : undefined,
      line_items: [
        {
          quantity: 1,
          price_data: { currency: "usd", unit_amount: amount_cents, product_data: { name } },
        },
      ],
      success_url: success_url || "https://example.com/success",
      cancel_url: cancel_url || "https://example.com/cancel",
    });

    return res.status(200).json({ url: session.url });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
}
