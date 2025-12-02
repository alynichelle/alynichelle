import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { supabase } from "../../../../lib/supabase";

export default function ClientPay() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [b, setB] = useState<any>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("bookings").select("*").eq("id", id).single();
      setB(data);
    })();
  }, [id]);

  async function payDeposit() {
    const amount_cents = b?.deposit_cents || 3000;
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount_cents,
        name: "Booking Deposit",
        booking_id: id,
        success_url: typeof window !== "undefined" ? window.location.origin + `/success?booking_id=${id}` : undefined,
        cancel_url: typeof window !== "undefined" ? window.location.origin + `/cancel` : undefined,
      }),
    });
    const j = await res.json();
    if (j?.url && typeof window !== "undefined") window.location.href = j.url;
    else setMsg(j?.error || "Could not create checkout session.");
  }

  if (!b) return <View style={{ padding: 16 }}><Text>Loading…</Text></View>;
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Pay Deposit</Text>
      <Text>Booking: {b.id}</Text>
      <Text>When: {new Date(b.start_at).toLocaleString()}</Text>
      <Text>Deposit: ${(b.deposit_cents / 100).toFixed(2)}</Text>
      <Pressable onPress={payDeposit} style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 }}>
        <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>Pay now</Text>
      </Pressable>
      {!!msg && <Text>{msg}</Text>}
    </View>
  );
}
