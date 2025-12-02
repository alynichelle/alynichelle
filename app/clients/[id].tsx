import { useLocalSearchParams, Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ClientDetailShell() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<any>(null);
  const [demOk, setDemOk] = useState<boolean>(false);
  const [formsOk, setFormsOk] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("clients").select("*").eq("id", id).single();
      setClient(data);
      const { data: dem } = await supabase.from("clients_demographics_ok").select("demographics_complete").eq("id", id).single();
      setDemOk(!!dem?.demographics_complete);
      const { data: reqForms } = await supabase
        .from("legal_forms")
        .select("id,version")
        .eq("is_active", true)
        .eq("is_required", true);
      const { data: acc } = await supabase
        .from("client_form_acceptances")
        .select("form_id,form_version")
        .eq("client_id", id);
      const signed = new Map((acc || []).map((a) => [a.form_id, a.form_version]));
      const allSigned = (reqForms || []).every((f) => signed.get(f.id) === f.version);
      setFormsOk(allSigned);
    })();
  }, [id]);

  if (!client) return <View style={{ padding: 16 }}><Text>Loading…</Text></View>;
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{client.name}</Text>
      <Text style={{ opacity: 0.7 }}>{client.email} · {client.phone}</Text>
      <Text>Demographics: {demOk ? "✅ complete" : "❌ incomplete"}</Text>
      <Text>Required forms: {formsOk ? "✅ signed" : "❌ missing"}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <Link href={`/clients/${id}/billing`} asChild><Pressable style={b}><Text style={t}>Billing</Text></Pressable></Link>
        <Link href={`/clients/${id}/forms`} asChild><Pressable style={b}><Text style={t}>Forms</Text></Pressable></Link>
        <Link href={`/clients/${id}/files`} asChild><Pressable style={b}><Text style={t}>Files</Text></Pressable></Link>
        <Link href={`/clients/${id}/book`} asChild><Pressable style={b}><Text style={t}>Book</Text></Pressable></Link>
      </View>
      <View style={{ marginTop: 8 }}>
        <Text style={{ fontWeight: "700" }}>Start Service</Text>
        <Pressable
          disabled={!demOk || !formsOk}
          style={{
            backgroundColor: !demOk || !formsOk ? "#ddd" : "#c6b1e6",
            padding: 12,
            borderRadius: 12,
            marginTop: 6,
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>
            {!demOk || !formsOk ? "Blocked until demographics + forms complete" : "Start"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
const b = { backgroundColor: "#c6b1e6", padding: 10, borderRadius: 10 };
const t = { fontWeight: "600", color: "#1a1a1f" };
