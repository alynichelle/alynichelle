import { supabase } from "../lib/supabase";
import { validateDiscount, applyDiscount } from "./discounts";
import { Services } from "./booking";

export async function makeInvoice({ booking_id, client_id, subtotal_cents, discount_code }:{
  booking_id?: string; client_id?: string; subtotal_cents: number; discount_code?: string;
}) {
  let discount_cents = 0; let total_cents = subtotal_cents;
  if (discount_code) {
    const { valid, discount } = await validateDiscount(discount_code);
    if (valid) {
      const r = applyDiscount(subtotal_cents, discount);
      discount_cents = r.discount_cents; total_cents = r.total_cents;
    }
  }
  const { data, error } = await supabase.from("invoices").insert({
    booking_id: booking_id ?? null,
    client_id: client_id ?? null,
    subtotal_cents, discount_code: discount_code ?? null,
    discount_cents, total_cents, status: total_cents === 0 ? "paid" : "open"
  }).select().single();
  return { invoice: data, error: error?.message };
}

// Create (or fetch) an invoice from a booking:
export async function ensureInvoiceForBooking(booking_id: string) {
  const { data: existing } = await supabase
    .from("invoices")
    .select("*")
    .eq("booking_id", booking_id)
    .limit(1);
  if (existing && existing.length) return { invoice: existing[0] };

  const { data: b, error: e1 } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", booking_id)
    .single();
  if (e1 || !b) return { error: e1?.message || "Booking not found" };

  const svc = Services.find((s) => s.id === b.service_id);
  const subtotal_cents = svc?.price_cents ?? 0;

  const { data: inv, error: e2 } = await supabase
    .from("invoices")
    .insert({
      booking_id,
      client_id: b.client_id ?? null,
      subtotal_cents,
      discount_code: null,
      discount_cents: 0,
      total_cents: subtotal_cents,
      status: subtotal_cents === 0 ? "paid" : "open",
      service_id: b.service_id ?? null,
      service_name: svc?.name ?? null,
      artist_name: b.artist_name ?? null,
    })
    .select()
    .single();
  if (e2) return { error: e2.message };
  return { invoice: inv };
}

export async function addPayment({ invoice_id, method, amount_cents, stripe_payment_intent_id, note }:{
  invoice_id: string; method: "cash"|"card"|"credit"; amount_cents: number; stripe_payment_intent_id?: string; note?: string;
}) {
  const { error } = await supabase.from("payments").insert({ invoice_id, method, amount_cents, stripe_payment_intent_id: stripe_payment_intent_id ?? null, note: note ?? null });
  if (error) return { error: error.message };
  // recalc invoice status
  const { data: inv } = await supabase.from("invoices").select("total_cents,id").eq("id", invoice_id).single();
  const { data: pays } = await supabase.from("payments").select("amount_cents").eq("invoice_id", invoice_id);
  const paid = (pays || []).reduce((s,p)=>s+(p.amount_cents||0),0);
  const status = paid === 0 ? "open" : (paid < inv.total_cents ? "partially_paid" : "paid");
  await supabase.from("invoices").update({ status }).eq("id", invoice_id);
  return { error: null };
}

export async function openDispute({ invoice_id, payment_id, client_id, channel, reason }:{
  invoice_id?: string; payment_id?: string; client_id?: string; channel: string; reason: string;
}) {
  const { error } = await supabase.from("disputes").insert({ invoice_id: invoice_id ?? null, payment_id: payment_id ?? null, client_id: client_id ?? null, channel, reason });
  return { error: error?.message };
}
