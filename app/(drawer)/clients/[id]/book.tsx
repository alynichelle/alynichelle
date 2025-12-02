import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { createBooking, Services, getTimeSlots } from "../../../../services/booking";

export default function BookFromClient() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [f, setF] = useState({ service_id: Services[0].id, date: "", time: "", notes: "" });
  const [slots, setSlots] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  async function pickDate(val: string) { setF({ ...f, date: val }); setSlots(await getTimeSlots(val, f.service_id)); }
  async function save() {
    const { error } = await createBooking({
      client_id: id,
      client_name: "Existing client", client_phone: "", service_id: f.service_id,
      date: f.date, time: f.time, notes: f.notes, deposit_cents: 0
    });
    setMsg(error ? error : "Booking created ✅");
  }
  return (
    <View style={{ gap:10, padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"700" }}>New booking for client</Text>
      <Text>Client ID: {id}</Text>
      <Text>Service</Text>
      <TextInput value={f.service_id} onChangeText={(v)=>setF({...f, service_id: v})} style={input}/>
      <Text>Date (YYYY-MM-DD)</Text>
      <TextInput value={f.date} onChangeText={pickDate} style={input}/>
      <Text>Time</Text>
      <TextInput value={f.time} onChangeText={(v)=>setF({...f, time:v})} placeholder={slots.join(", ")} style={input}/>
      <Text>Notes</Text>
      <TextInput value={f.notes} onChangeText={(v)=>setF({...f, notes:v})} style={input}/>
      <Pressable onPress={save} style={{ backgroundColor:"#c6b1e6", padding:12, borderRadius:12 }}>
        <Text style={{ textAlign:"center", fontWeight:"600", color:"#1a1a1f" }}>Save</Text>
      </Pressable>
      {!!msg && <Text>{msg}</Text>}
    </View>
  );
}
const input = { borderWidth:1, borderColor:"#ddd", borderRadius:10, padding:10 };
