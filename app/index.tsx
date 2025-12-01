import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { useToday } from "../lib/utils";

export default function Dashboard() {
  const today = useToday();
  return (
    <View style={{ gap: 16, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Alyssa's Esthetics</Text>
      <Text style={{ opacity: 0.6 }}>Today is {today} • You’ve got this ✨</Text>

      <Link href="/booking" asChild>
        <Pressable style={button}><Text style={label}>Create Booking</Text></Pressable>
      </Link>
      <Link href="/clients" asChild>
        <Pressable style={button}><Text style={label}>Clients</Text></Pressable>
      </Link>
      <Link href="/inventory" asChild>
        <Pressable style={button}><Text style={label}>Inventory</Text></Pressable>
      </Link>
      <Link href="/payments/checkout" asChild>
        <Pressable style={button}><Text style={label}>Take Payment</Text></Pressable>
      </Link>
    </View>
  );
}
const button = { backgroundColor: "#c6b1e6", padding: 14, borderRadius: 12 };
const label = { textAlign: "center", fontWeight: "600", color: "#1a1a1f" };
