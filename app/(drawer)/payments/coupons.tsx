import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, Switch } from "react-native";
import { supabase } from "../../../lib/supabase";

export default function Coupons() {
  const [items, setItems] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>({ code: "", kind: "percent", amount: "10", max_redemptions: "" });
  async function refresh() {
    const { data } = await supabase.from("discounts").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  }
  useEffect(() => {
    refresh();
  }, []);
  async function create() {
    const { error } = await supabase.from("discounts").insert({
      code: draft.code.trim().toUpperCase(),
      kind: draft.kind,
      amount: Number(draft.amount || 0),
      max_redemptions: draft.max_redemptions ? Number(draft.max_redemptions) : null,
      is_active: true,
    });
    if (!error) {
      setDraft({ code: "", kind: "percent", amount: "10", max_redemptions: "" });
      refresh();
    }
  }
  async function toggle(id: string, v: boolean) {
    await supabase.from("discounts").update({ is_active: v }).eq("id", id);
    refresh();
  }
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Coupons</Text>
      <View style={{ borderWidth: 1, borderColor: "#eee", borderRadius: 12, padding: 12 }}>
        <Text style={{ fontWeight: "700" }}>Create</Text>
        <Text>Code</Text>
        <TextInput value={draft.code} onChangeText={(v) => setDraft({ ...draft, code: v })} style={input} />
        <Text>Kind (percent/fixed)</Text>
        <TextInput value={draft.kind} onChangeText={(v) => setDraft({ ...draft, kind: v })} style={input} />
        <Text>Amount {draft.kind === "percent" ? "(%)" : "(cents)"}</Text>
        <TextInput keyboardType="numeric" value={draft.amount} onChangeText={(v) => setDraft({ ...draft, amount: v })} style={input} />
        <Text>Max redemptions (optional)</Text>
        <TextInput keyboardType="numeric" value={draft.max_redemptions} onChangeText={(v) => setDraft({ ...draft, max_redemptions: v })} style={input} />
        <Pressable onPress={create} style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12, marginTop: 8 }}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>Create</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ fontWeight: "700" }}>{item.code}</Text>
            <Text>{item.kind} · {item.kind === "percent" ? `${item.amount}%` : `$${(item.amount / 100).toFixed(2)}`}</Text>
            <Text>Used: {item.redemptions || 0}{item.max_redemptions ? `/${item.max_redemptions}` : ""}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
              <Switch value={!!item.is_active} onValueChange={(v) => toggle(item.id, v)} />
              <Text>Active</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
const input = { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 };
