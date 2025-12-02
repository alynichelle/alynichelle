import { useLocalSearchParams, Link } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { supabase } from "../../../lib/supabase";

export default function ClientUpcoming() {
  const { client_id } = useLocalSearchParams<{ client_id: string }>();
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("client_id", client_id)
        .gte("start_at", now)
        .order("start_at", { ascending: true });
      setItems(data || []);
    })();
  }, [client_id]);

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Your Upcoming Bookings</Text>
      <FlatList
        data={items}
        keyExtractor={(b) => b.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ fontWeight: "600" }}>{new Date(item.start_at).toLocaleString()}</Text>
            <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
              <Link href={`/client/booking/${item.id}/pay`} asChild>
                <Pressable style={{ backgroundColor: "#c6b1e6", padding: 8, borderRadius: 8 }}>
                  <Text style={{ fontWeight: "600", color: "#1a1a1f" }}>Pay Deposit</Text>
                </Pressable>
              </Link>
              <Link href={`/client/booking/${item.id}/cancel`} asChild>
                <Pressable style={{ backgroundColor: "#eee", padding: 8, borderRadius: 8 }}>
                  <Text style={{ fontWeight: "600" }}>Request Cancel</Text>
                </Pressable>
              </Link>
            </View>
          </View>
        )}
      />
    </View>
  );
}
