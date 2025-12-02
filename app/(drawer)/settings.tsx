import { View, Text, Pressable, Switch, TextInput, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Settings() {
  const [s, setS] = useState<any>({ late_cancel_hours: 48, late_cancel_fee_cents: 2500, auto_charge_enabled: false, auto_block_external: true });
  const [rowId, setRowId] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("business_settings").select("*").limit(1).maybeSingle();
      if (data) {
        setS(data);
        setRowId(data.id);
      }
      const { data: srcs } = await supabase.from("calendar_sources").select("*").order("created_at", { ascending: false });
      setSources(srcs || []);
    })();
  }, []);

  async function save() {
    if (rowId) await supabase.from("business_settings").update(s).eq("id", rowId);
    else {
      const { data } = await supabase.from("business_settings").insert(s).select().single();
      setRowId(data?.id || null);
    }
  }

  async function syncSource(id: string) {
    await fetch("/api/sync-calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ calendar_source_id: id }),
    });
  }

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Settings</Text>
      <Text>Late cancel window (hours)</Text>
      <TextInput
        keyboardType="numeric"
        value={String(s.late_cancel_hours)}
        onChangeText={(v) => setS({ ...s, late_cancel_hours: Number(v || 0) })}
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
      />
      <Text>Late cancel fee (cents)</Text>
      <TextInput
        keyboardType="numeric"
        value={String(s.late_cancel_fee_cents)}
        onChangeText={(v) => setS({ ...s, late_cancel_fee_cents: Number(v || 0) })}
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
      />
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
        <Switch value={!!s.auto_charge_enabled} onValueChange={(v) => setS({ ...s, auto_charge_enabled: v })} />
        <Text>Auto-charge card on file (default OFF)</Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
        <Switch value={!!s.auto_block_external} onValueChange={(v) => setS({ ...s, auto_block_external: v })} />
        <Text>Auto-block time from connected calendars</Text>
      </View>
      <Pressable onPress={save} style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 }}>
        <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>Save</Text>
      </Pressable>

      <Text style={{ fontSize: 16, fontWeight: "700", marginTop: 12 }}>Calendar Sources</Text>
      <FlatList
        data={sources}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 8 }}>
            <Text style={{ fontWeight: "700" }}>{item.name || item.kind}</Text>
            <Text style={{ opacity: 0.7 }}>{item.ics_url ? "ICS" : item.kind}</Text>
            <Pressable onPress={() => syncSource(item.id)} style={{ marginTop: 8, backgroundColor: "#eee", padding: 10, borderRadius: 10 }}>
              <Text style={{ textAlign: "center", fontWeight: "600" }}>Sync now</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}
