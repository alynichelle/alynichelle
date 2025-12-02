import dayjs from "dayjs";
import { supabase } from "../lib/supabase";

export async function listBookingsBetween(startISO: string, endISO: string) {
  const { data } = await supabase.from("bookings").select("*").gte("start_at", startISO).lt("end_at", endISO);
  return data || [];
}
export async function listBlocksBetween(startISO: string, endISO: string) {
  const { data } = await supabase.from("availability_blocks").select("*").gte("start_at", startISO).lt("end_at", endISO);
  return data || [];
}
export function rangeForView(view:"month"|"week"|"day", ref: string) {
  const d = dayjs(ref);
  if (view==="day")  return { start: d.startOf("day"), end: d.endOf("day") };
  if (view==="week") return { start: d.startOf("week"), end: d.endOf("week") };
  return { start: d.startOf("month"), end: d.endOf("month") };
}
export async function requestCancellation(booking_id: string, reason?: string) {
  const { error } = await supabase.from("cancellation_requests").insert({ booking_id, reason: reason ?? null });
  return { error: error?.message };
}
export async function applyCancellationPolicy(booking: any, settings: { late_cancel_hours: number, late_cancel_fee_cents: number }) {
  const hoursBefore = dayjs(booking.start_at).diff(dayjs(), "hour");
  const late = hoursBefore < (settings?.late_cancel_hours ?? 48);
  return { late, fee_cents: late ? (settings?.late_cancel_fee_cents ?? 2500) : 0 };
}
