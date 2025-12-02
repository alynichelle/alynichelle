import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";

export default function Cancel() {
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Payment canceled</Text>
      <Text style={{ opacity: 0.7 }}>
        The checkout session was canceled. You can try again any time.
      </Text>
      <Link href="/payments/checkout" asChild>
        <Pressable style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12 }}>
          <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>
            Return to Checkout
          </Text>
        </Pressable>
      </Link>
    </View>
  );
}
