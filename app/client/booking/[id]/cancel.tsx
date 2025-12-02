import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { requestCancellation } from "../../../../services/calendar";

export default function ClientCancel() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    const { error } = await requestCancellation(id, reason);
    setMsg(error ? error : "Cancellation requested. We’ll email you when approved/denied.");
  }
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Request Cancellation</Text>
      <Text>Tell us why (optional)</Text>
      <TextInput value={reason} onChangeText={setReason} style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }} />
      <Pressable onPress={submit} style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 }}>
        <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>Submit</Text>
      </Pressable>
      {!!msg && <Text>{msg}</Text>}
    </View>
  );
}
