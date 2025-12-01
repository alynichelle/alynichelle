import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { useAuth } from "../lib/auth";

export default function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setLoading(true);
    const err = await signIn(email.trim(), password);
    setLoading(false);
    setMsg(err ? `Error: ${err}` : "Signed in! Redirecting…");
  }

  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Welcome back</Text>
      <Text style={{ opacity: 0.7 }}>Sign in to Alyssa’s Esthetics</Text>
      <View style={{ gap: 8 }}>
        <Text>Email</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
        />
        <Text>Password</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
        />
        <Pressable
          disabled={loading}
          onPress={onSubmit}
          style={{
            backgroundColor: "#c6b1e6",
            padding: 12,
            borderRadius: 12,
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>
            {loading ? "Signing in…" : "Sign in"}
          </Text>
        </Pressable>
        {!!msg && <Text>{msg}</Text>}
      </View>
    </View>
  );
}
