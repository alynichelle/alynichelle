import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList, Switch } from "react-native";
import { supabase } from "../../lib/supabase";

export default function SettingsPlugins() {
  const [items, setItems] = useState<any[]>([]);
  const [msg, setMsg] = useState("");
  const [draft, setDraft] = useState<any>({ kind: "apple_ics", label: "", ics_url: "" });

  async function refresh() {
    const { data } = await supabase.from("integrations").select("*").order("created_at", { ascending: false });
    setItems(data || []);
  }
  useEffect(() => {
    refresh();
  }, []);

  async function addIcs() {
    if (!draft.ics_url) {
      setMsg("ICS URL required");
      return;
    }
    const { data: integ, error } = await supabase
      .from("integrations")
      .insert({
        kind: draft.kind,
        label: draft.label || "Calendar (ICS)",
        config: { ics_url: draft.ics_url },
      })
      .select()
      .single();
    if (error) {
      setMsg(error.message);
      return;
    }
    await supabase.from("calendar_sources").insert({
      integration_id: integ.id,
      kind: "ics",
      name: draft.label || "ICS Calendar",
      ics_url: draft.ics_url,
      is_active: true,
    });
    setDraft({ kind: "apple_ics", label: "", ics_url: "" });
    setMsg("ICS calendar added.");
    refresh();
  }

  async function toggle(id: string, v: boolean) {
    await supabase.from("integrations").update({ is_active: v }).eq("id", id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, is_active: v } : i)));
  }

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Plugins</Text>
      <Text style={{ fontWeight: "700", marginTop: 6 }}>Calendars (ICS)</Text>
      <Text>Paste any ICS URL (Apple iCal, Google public ICS, Notion ICS).</Text>
      <Text>Label</Text>
      <TextInput value={draft.label} onChangeText={(v) => setDraft({ ...draft, label: v })} style={input} />
      <Text>ICS URL</Text>
      <TextInput value={draft.ics_url} onChangeText={(v) => setDraft({ ...draft, ics_url: v })} style={input} />
      <Pressable onPress={addIcs} style={primary}>
        <Text style={primaryT}>Add ICS</Text>
      </Pressable>

      <Text style={{ fontWeight: "700", marginTop: 12 }}>Square (coming soon)</Text>
      <Text style={{ opacity: 0.7 }}>
        Use your Square account for in-person card charges. (We’ll store a token here when you connect.)
      </Text>

      <Text style={{ fontWeight: "700", marginTop: 12 }}>Google Calendar (coming soon)</Text>
      <Text style={{ opacity: 0.7 }}>OAuth connection to pick calendars to sync. For now, use the ICS public link above.</Text>

      <Text style={{ fontWeight: "700", marginTop: 12 }}>Notion Calendar (beta)</Text>
      <Text style={{ opacity: 0.7 }}>If Notion offers an ICS link, paste it above. Otherwise we’ll add API auth soon.</Text>

      <Text style={{ fontWeight: "700", marginTop: 12 }}>Connected</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={card}>
            <Text style={{ fontWeight: "700" }}>{item.label || item.kind}</Text>
            <Text style={{ opacity: 0.7 }}>{item.kind}</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 }}>
              <Switch value={!!item.is_active} onValueChange={(v) => toggle(item.id, v)} />
              <Text>Active</Text>
            </View>
          </View>
        )}
      />
      {!!msg && <Text>{msg}</Text>}
    </View>
  );
}
const input = { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 };
const primary = { backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12, marginTop: 8 };
const primaryT = { textAlign: "center", fontWeight: "700", color: "#1a1a1f" };
const card = { padding: 12, borderWidth: 1, borderColor: "#eee", borderRadius: 12, marginBottom: 8 };
