import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { z } from "zod";
import { createBooking, Services, getTimeSlots } from "../services/booking";

const BookingForm = z.object({
  client_name: z.string().min(1),
  client_phone: z.string().min(7),
  service_id: z.string().min(1),
  date: z.string().min(1),
  time: z.string().min(1),
  notes: z.string().optional(),
  deposit_cents: z.number().int().nonnegative().default(0)
});

export default function Booking() {
  const [form, setForm] = useState({
    client_name: "",
    client_phone: "",
    service_id: Services[0].id,
    date: "",
    time: "",
    notes: "",
    deposit_cents: 0
  });
  const [slots, setSlots] = useState<string[]>([]);
  const [message, setMessage] = useState<string>("");

  async function onPickDate(val: string) {
    setForm({ ...form, date: val });
    const s = await getTimeSlots(val, form.service_id);
    setSlots(s);
  }

  async function onSubmit() {
    const parsed = BookingForm.safeParse({ ...form, deposit_cents: Number(form.deposit_cents) || 0 });
    if (!parsed.success) {
      setMessage("Please fill all required fields.");
      return;
    }
    const { error } = await createBooking(parsed.data);
    setMessage(error ? `Error: ${error}` : "Booking created ✅");
  }

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>New Booking</Text>
      <Input label="Client name" value={form.client_name} onChangeText={(v)=>setForm({...form, client_name:v})}/>
      <Input label="Phone" value={form.client_phone} onChangeText={(v)=>setForm({...form, client_phone:v})}/>
      <Select label="Service" value={form.service_id} options={Services.map(s=>({label:`${s.name} — $${(s.price_cents/100).toFixed(2)}`, value:s.id}))}
              onChange={(v)=>setForm({...form, service_id:v})}/>
      <Input label="Date (YYYY-MM-DD)" value={form.date} onChangeText={onPickDate}/>
      <Select label="Time" value={form.time} options={slots.map(t=>({label:t, value:t}))}
              onChange={(v)=>setForm({...form, time:v})}/>
      <Input label="Notes (optional)" value={form.notes} onChangeText={(v)=>setForm({...form, notes:v})}/>
      <Input label="Deposit (cents)" keyboardType="numeric" value={String(form.deposit_cents)} onChangeText={(v)=>setForm({...form, deposit_cents: Number(v)})}/>
      <Pressable style={button} onPress={onSubmit}><Text style={label}>Save Booking</Text></Pressable>
      {!!message && <Text>{message}</Text>}
    </View>
  );
}

function Input({ label, ...props }: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text>{label}</Text>
      <TextInput {...props} style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}/>
    </View>
  );
}
function Select({ label, value, options, onChange }: any) {
  return (
    <View style={{ gap: 6 }}>
      <Text>{label}</Text>
      <View style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10 }}>
        {/* Simple select for web; on native use a proper picker later */}
        <TextInput value={value} onChangeText={onChange} placeholder={`Choose: ${options.map((o:any)=>o.label).join(", ")}`} style={{ padding: 10 }}/>
      </View>
    </View>
  );
}
const button = { backgroundColor: "#c6b1e6", padding: 14, borderRadius: 12 };
const label = { textAlign: "center", fontWeight: "600", color: "#1a1a1f" };
