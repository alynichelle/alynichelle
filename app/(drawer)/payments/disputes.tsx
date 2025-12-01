import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, FlatList } from "react-native";
import { supabase } from "../../../lib/supabase";

export default function Disputes() {
  const [items, setItems] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>({ invoice_id:"", payment_id:"", client_id:"", channel:"stripe", reason:"" });
  async function refresh() { const { data } = await supabase.from("disputes").select("*").order("opened_at",{ascending:false}); setItems(data||[]); }
  useEffect(()=>{ refresh(); },[]);
  async function add() {
    const { error } = await supabase.from("disputes").insert({
      invoice_id: draft.invoice_id || null, payment_id: draft.payment_id || null, client_id: draft.client_id || null, channel: draft.channel, reason: draft.reason
    });
    if (!error) { setDraft({ invoice_id:"", payment_id:"", client_id:"", channel:"stripe", reason:"" }); refresh(); }
  }
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Disputes</Text>
      <View style={{ gap: 6 }}>
        <TextInput placeholder="Invoice ID (optional)" value={draft.invoice_id} onChangeText={(v)=>setDraft({...draft, invoice_id:v})} style={input}/>
        <TextInput placeholder="Payment ID (optional)" value={draft.payment_id} onChangeText={(v)=>setDraft({...draft, payment_id:v})} style={input}/>
        <TextInput placeholder="Client ID (optional)" value={draft.client_id} onChangeText={(v)=>setDraft({...draft, client_id:v})} style={input}/>
        <TextInput placeholder="Channel (stripe/cash/credit)" value={draft.channel} onChangeText={(v)=>setDraft({...draft, channel:v})} style={input}/>
        <TextInput placeholder="Reason" value={draft.reason} onChangeText={(v)=>setDraft({...draft, reason:v})} style={input}/>
        <Pressable onPress={add} style={{ backgroundColor:"#c6b1e6", padding:12, borderRadius:12 }}>
          <Text style={{ textAlign:"center", fontWeight:"600", color:"#1a1a1f" }}>Log Dispute</Text>
        </Pressable>
      </View>
      <FlatList
        data={items}
        keyExtractor={(i)=>i.id}
        renderItem={({item})=>(
          <View style={{ padding: 12, borderWidth:1, borderColor:"#eee", borderRadius:12, marginBottom:8 }}>
            <Text style={{ fontWeight:"600" }}>{item.channel?.toUpperCase()} · {item.status}</Text>
            <Text>Reason: {item.reason}</Text>
            <Text style={{ opacity: 0.7 }}>Invoice: {item.invoice_id || "—"} · Payment: {item.payment_id || "—"} · Client: {item.client_id || "—"}</Text>
          </View>
        )}
      />
    </View>
  );
}
const input = { borderWidth:1, borderColor:"#ddd", borderRadius:10, padding:10 };
