import { supabase } from "../lib/supabase";
export type Client = { id: string; name: string; phone?: string | null; email?: string | null };
export async function listClients(): Promise<Client[]> {
  const { data } = await supabase.from("clients").select("id,name,phone,email").order("name", { ascending: true });
  return data || [];
}
export async function getClient(id: string) {
  const { data } = await supabase.from("clients").select("*").eq("id", id).single();
  return data;
}
export async function upsertClient(c: Partial<Client>) {
  const { error } = await supabase.from("clients").upsert(c).select().single();
  return { error: error?.message };
}
export async function upsertClientNote({ client_id, body }: { client_id: string; body: string }) {
  const { error } = await supabase.from("client_notes").insert({ client_id, body });
  return { error: error?.message };
}
