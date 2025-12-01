import dayjs from "dayjs";
import { supabase } from "../lib/supabase";

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
  client_name: string; client_phone: string; service_id: string;
  date: string; time: string; notes?: string; deposit_cents: number;
}) {
  const start = dayjs(`${input.date} ${input.time}`);
  const service = Services.find(s => s.id === input.service_id)!;
  const end = start.add(service.duration_min, "minute");
  const { error } = await supabase.from("bookings").insert({
    client_name: input.client_name,
    client_phone: input.client_phone,
    service_id: input.service_id,
    start_at: start.toISOString(),
    end_at: end.toISOString(),
    notes: input.notes ?? null,
    deposit_cents: input.deposit_cents
  });
  return { error: error?.message };
}

export async function startPaymentIntent(_params: { amount_cents: number }) {
  // Implement with your serverless function. Placeholder for now.
  return { url: "" };
}
