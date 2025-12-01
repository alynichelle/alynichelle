import { useLocalSearchParams } from "expo-router";
import { View, Text, TextInput, Pressable } from "react-native";
import { getClient, upsertClientNote } from "../../services/clients";
import { useEffect, useState } from "react";

export default function ClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    (async () => setClient(await getClient(id)))();
  }, [id]);

  async function saveNote() {
    await upsertClientNote({ client_id: id, body: note });
    setNote("");
  }

  if (!client) return <View style={{ padding:16 }}><Text>Loading…</Text></View>;
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{client.name}</Text>
      <Text style={{ opacity: 0.7 }}>{client.phone} · {client.email}</Text>

      <Text style={{ marginTop: 10, fontWeight: "600" }}>Add Note</Text>
      <TextInput value={note} onChangeText={setNote} placeholder="Visit notes, retention, reactions, etc."
                 style={{ borderWidth:1, borderColor:"#ddd", borderRadius:10, padding:10 }} multiline/>
      <Pressable onPress={saveNote} style={{ backgroundColor:"#c6b1e6", padding:12, borderRadius:12 }}>
        <Text style={{ textAlign:"center", fontWeight:"600", color:"#1a1a1f" }}>Save Note</Text>
      </Pressable>
    </View>
  );
}
