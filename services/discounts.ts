import dayjs from "dayjs";
import { supabase } from "../lib/supabase";

export async function validateDiscount(code: string) {
  if (!code) return { valid: false, reason: "No code" };
  const { data } = await supabase.from("discounts").select("*").eq("code", code).eq("is_active", true).single();
  const d = data as any;
  if (!d) return { valid: false, reason: "Not found" };
  const now = dayjs();
  if (d.starts_at && now.isBefore(dayjs(d.starts_at))) return { valid: false, reason: "Not started" };
  if (d.ends_at && now.isAfter(dayjs(d.ends_at))) return { valid: false, reason: "Expired" };
  if (d.max_redemptions && d.redemptions >= d.max_redemptions) return { valid: false, reason: "Limit reached" };
  return { valid: true, discount: d };
}

export function applyDiscount(subtotal_cents: number, d: any) {
  if (!d) return { discount_cents: 0, total_cents: subtotal_cents };
  if (d.kind === "percent") {
    const discount_cents = Math.round((subtotal_cents * d.amount) / 100);
    return { discount_cents, total_cents: Math.max(0, subtotal_cents - discount_cents) };
  }
  if (d.kind === "fixed") {
    const discount_cents = Math.min(subtotal_cents, d.amount);
    return { discount_cents, total_cents: Math.max(0, subtotal_cents - discount_cents) };
  }
  return { discount_cents: 0, total_cents: subtotal_cents };
}
