import dayjs from "dayjs";
import { supabase } from "../lib/supabase";
import { makeInvoice } from "./payments";

async function demographicsComplete(client_id: string | undefined) {
  if (!client_id) return true;
  const { data } = await supabase
    .from("clients_demographics_ok")
    .select("demographics_complete")
    .eq("id", client_id)
    .single();
  return !!data?.demographics_complete;
}

export const Services = [
  { id: "classic-full", name: "Classic Full Set", duration_min: 120, price_cents: 12000, deposit_cents: 3000 },
  { id: "hybrid-fill", name: "Hybrid Fill", duration_min: 75, price_cents: 7000, deposit_cents: 1500 },
  { id: "volume-full", name: "Volume Full Set", duration_min: 150, price_cents: 16000, deposit_cents: 4000 }
] as const;

export async function getTimeSlots(dateISO: string, service_id: string) {
  // MVP: 9a–5p every 30 min, filter out overlaps from existing bookings
  const start = dayjs(dateISO).hour(9).minute(0);
  const end = dayjs(dateISO).hour(17).minute(0);
  const slots: string[] = [];
  let t = start;
  while (t.isBefore(end)) {
    slots.push(t.format("HH:mm"));
    t = t.add(30, "minute");
  }
  // TODO: fetch existing bookings and remove conflicts
  return slots;
}

export async function createBooking(input: {
  client_name: string;
  client_phone: string;
  service_id: string;
  date: string;
  time: string;
  notes?: string;
  deposit_cents: number;
  discount_code?: string;
  client_id?: string;
  artist_name?: string; // optional override
}) {
  const start = dayjs(`${input.date} ${input.time}`);
  const service = Services.find(s => s.id === input.service_id)!;
  const end = start.add(service.duration_min, "minute");
  if (!(await demographicsComplete(input.client_id))) {
    return { error: "Client demographics are incomplete. Please complete client details before booking." };
  }

  const { error } = await supabase.from("bookings").insert({
    client_id: input.client_id ?? null,
    client_name: input.client_name,
    client_phone: input.client_phone,
    service_id: input.service_id,
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    notes: input.notes ?? null,
    deposit_cents: input.deposit_cents,
    artist_name: input.artist_name ?? "Alyssa Collins",
  });
  return { error: error?.message };

  // Optionally create an invoice now (subtotal=service price)
  // const { invoice } = await makeInvoice({
  //   booking_id: (ins?.[0]?.id) as string | undefined,
  //   subtotal_cents: service.price_cents,
  //   discount_code: input.discount_code
  // });
}

function buildApiUrl(base: string | undefined, path: string) {
  const normalized = (base || "").replace(/\/$/, "");
  if (!normalized) return path;
  return `${normalized}${path.startsWith("/") ? "" : "/"}${path}`;
}

export async function startPaymentIntent(params: {
  amount_cents: number;
  success_url?: string;
  cancel_url?: string;
  apiBaseUrl?: string;
}) {
  const endpoint = buildApiUrl(params.apiBaseUrl, "/api/create-checkout-session");
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount_cents: params.amount_cents,
      success_url: params.success_url,
      cancel_url: params.cancel_url,
    }),
  });

  if (!res.ok) {
    const message = await res.text();
    return { error: message || "Unable to create checkout session" };
  }
  return res.json() as Promise<{ url?: string; error?: string }>;
}
