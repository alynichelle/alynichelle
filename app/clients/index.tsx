import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { useEffect, useState } from "react";
import { listClients, upsertClient, Client } from "../../services/clients";
import { Link } from "expo-router";

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [draft, setDraft] = useState<Partial<Client>>({ name: "", phone: "", email: "" });

  async function refresh() { setClients(await listClients()); }
  useEffect(() => { refresh(); }, []);

  async function save() {
    if (!draft.name) return;
    await upsertClient(draft as Client);
    setDraft({ name: "", phone: "", email: "" });
    refresh();
  }

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Clients</Text>
      <View style={{ gap: 8 }}>
        <TextInput placeholder="Name" value={draft.name as any} onChangeText={(v)=>setDraft({...draft, name:v})} style={input}/>
        <TextInput placeholder="Phone" value={draft.phone as any} onChangeText={(v)=>setDraft({...draft, phone:v})} style={input}/>
        <TextInput placeholder="Email" value={draft.email as any} onChangeText={(v)=>setDraft({...draft, email:v})} style={input}/>
        <Pressable style={button} onPress={save}><Text style={label}>Save</Text></Pressable>
      </View>
      <FlatList
        data={clients}
        keyExtractor={(c)=>c.id}
        renderItem={({item})=>(
          <Link href={`/clients/${item.id}`} asChild>
            <Pressable style={{ padding: 12, borderWidth:1, borderColor:"#eee", borderRadius:12, marginBottom:8 }}>
              <Text style={{ fontWeight: "600" }}>{item.name}</Text>
              <Text style={{ opacity: 0.7 }}>{item.phone || item.email}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}
const input = { borderWidth:1, borderColor:"#ddd", borderRadius:10, padding:10 };
const button = { backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 };
const label = { textAlign: "center", fontWeight: "600", color: "#1a1a1f" };
