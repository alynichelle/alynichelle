import { View, Text, Pressable } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";

export default function Success() {
  const params = useLocalSearchParams<{ booking_id?: string }>();
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Payment Successful 🎉</Text>
      <Text style={{ opacity: 0.7 }}>Thank you! Your deposit was received.</Text>
      {params.booking_id ? <Text>Booking ID: {params.booking_id}</Text> : null}
      <Link href="/" asChild>
        <Pressable style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 }}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>
            Back to Dashboard
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
