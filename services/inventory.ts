import { supabase } from "../lib/supabase";
export type InventoryItem = {
  id?: string;
  name: string;
  sku: string;
  stock: number;
  cost_cents: number;
};
export async function listItems(): Promise<InventoryItem[]> {
  const { data } = await supabase.from("inventory").select("*").order("name", { ascending: true });
  return data || [];
}
export async function upsertItem(item: InventoryItem) {
  const { error } = await supabase.from("inventory").upsert(item, { onConflict: "sku" });
  return { error: error?.message };
}
