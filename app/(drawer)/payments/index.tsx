import { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { supabase } from "../../../lib/supabase";
import { Link } from "expo-router";

export default function PaymentsHome() {
  const [invoices, setInvoices] = useState<any[]>([]);
  async function refresh() {
    const { data } = await supabase.from("invoices").select("*").order("created_at", { ascending: false }).limit(50);
    setInvoices(data || []);
  }
  useEffect(() => {
    refresh();
  }, []);
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Invoices</Text>
      <FlatList
        data={invoices}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <Link href={`/payments/invoice/${item.id}`} asChild>
            <Pressable style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 8 }}>
              <Text style={{ fontWeight: "600" }}>{item.status.toUpperCase()} · ${(item.total_cents / 100).toFixed(2)}</Text>
              <Text style={{ opacity: 0.7 }}>Invoice: {item.id.slice(0, 8)}… {item.client_id ? `· Client ${item.client_id.slice(0, 6)}…` : ""}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
