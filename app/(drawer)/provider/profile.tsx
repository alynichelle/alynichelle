import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { supabase } from "../../../lib/supabase";

export default function ProviderProfile() {
  const [row, setRow] = useState<any>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("providers").select("*").limit(1);
      setRow((data && data[0]) || { name: "Alyssa Collins", bio: "", photo_url: "", specialties: ["Lashes", "Beauty"] });
    })();
  }, []);

  async function save() {
    if (!row?.id) {
      const { data, error } = await supabase.from("providers").insert(row).select().single();
      if (error) {
        setMsg(error.message);
        return;
      }
      setRow(data);
      setMsg("Saved.");
    } else {
      const { error } = await supabase.from("providers").update(row).eq("id", row.id);
      setMsg(error ? error.message : "Saved.");
    }
  }

  if (!row) return <View style={{ padding: 16 }}><Text>Loading…</Text></View>;

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Provider Profile</Text>
      <Text>Name</Text>
      <TextInput value={row.name} onChangeText={(v) => setRow({ ...row, name: v })} style={input} />
      <Text>Photo URL</Text>
      <TextInput value={row.photo_url || ""} onChangeText={(v) => setRow({ ...row, photo_url: v })} style={input} />
      <Text>Bio</Text>
      <TextInput
        multiline
        value={row.bio || ""}
        onChangeText={(v) => setRow({ ...row, bio: v })}
        style={[input, { height: 120, textAlignVertical: "top" }]}
      />
      <Text>Specialties (comma separated)</Text>
      <TextInput
        value={(row.specialties || []).join(", ")}
        onChangeText={(v) => setRow({ ...row, specialties: v.split(",").map((x) => x.trim()).filter(Boolean) })}
        style={input}
      />
      <Pressable onPress={save} style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 }}>
        <Text style={{ textAlign: "center", fontWeight: "700", color: "#1a1a1f" }}>Save</Text>
      </Pressable>
      {!!msg && <Text>{msg}</Text>}
    </View>
  );
}

const input = { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 };
