import { supabase } from "./supabase";

export async function getUserRole(): Promise<"owner" | "staff"> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return "staff";
  const { data } = await supabase.from("staff_roles").select("*").eq("user_id", uid).single();
  return (data?.role as any) || "staff";
}

export async function isOwner() {
  return (await getUserRole()) === "owner";
}
