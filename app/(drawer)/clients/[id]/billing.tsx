import { useLocalSearchParams, Link } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { supabase } from "../../../../lib/supabase";
import { ensureInvoiceForBooking } from "../../../../services/payments";

export default function ClientBilling() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [bookings, setBookings] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [msg, setMsg] = useState("");

  async function refresh() {
    const [{ data: bks }, { data: invs }] = await Promise.all([
      supabase.from("bookings").select("*").eq("client_id", id).order("start_at", { ascending: false }).limit(20),
      supabase.from("invoices").select("*").eq("client_id", id).order("created_at", { ascending: false }).limit(20),
    ]);
    setBookings(bks || []);
    setInvoices(invs || []);
  }
  useEffect(() => {
    refresh();
  }, [id]);

  async function createFrom(bookingId: string) {
    const r: any = await ensureInvoiceForBooking(bookingId);
    if (r.error) {
      setMsg(r.error);
      return;
    }
    setMsg("Invoice created ✅");
    refresh();
  }

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Billing</Text>
      <Text style={{ fontWeight: "700", marginTop: 4 }}>Create invoice from a booking</Text>
      <FlatList
        data={bookings}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 8 }}>
            <Text>{new Date(item.start_at).toLocaleString()}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              <Pressable onPress={() => createFrom(item.id)} style={{ backgroundColor: "#c6b1e6", padding: 8, borderRadius: 8 }}>
                <Text style={{ fontWeight: "700", color: "#1a1a1f" }}>Create invoice</Text>
              </Pressable>
              <Link href={`/bookings/${item.id}`} asChild>
                <Pressable style={{ backgroundColor: "#eee", padding: 8, borderRadius: 8 }}>
                  <Text style={{ fontWeight: "600" }}>Open booking</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        )}
      />
      <Text style={{ fontWeight: "700", marginTop: 6 }}>Recent invoices</Text>
      <FlatList
        data={invoices}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Link href={`/payments/invoice/${item.id}`} asChild>
            <Pressable style={{ padding: 10, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 8 }}>
              <Text style={{ fontWeight: "700" }}>{item.status.toUpperCase()} · ${(item.total_cents / 100).toFixed(2)}</Text>
              <Text style={{ opacity: 0.7 }}>
                {item.id.slice(0, 8)}… {item.service_name ? `· ${item.service_name}` : ""}
              </Text>
            </Pressable>
          </Link>
        )}
      />
      {!!msg && <Text>{msg}</Text>}
    </View>
  );
}
