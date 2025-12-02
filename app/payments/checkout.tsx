import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Checkout() {
  // You can deep-link in a booking id like: /payments/checkout?booking_id=UUID
  const params = useLocalSearchParams<{ booking_id?: string }>();
  const [amount, setAmount] = useState<string>("30.00"); // default deposit in USD
  const [bookingId, setBookingId] = useState<string>(params.booking_id ?? "");
  const [loading, setLoading] = useState(false);

  function originSafe() {
    if (typeof window !== "undefined" && window?.location?.origin) return window.location.origin;
    return "https://example.com";
  }

  async function goToCheckout() {
    setLoading(true);
    const amount_cents = Math.round((parseFloat(amount || "0") || 0) * 100);
    const res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount_cents,
        name: "Lash Deposit",
        booking_id: bookingId || undefined,
        // Send booking_id back on success so success screen can show it
        success_url: `${originSafe()}/success${bookingId ? `?booking_id=${bookingId}` : ""}`,
        cancel_url: `${originSafe()}/cancel`,
      }),
    });
    const data = await res.json();
    if (data?.url) {
      if (typeof window !== "undefined") window.location.href = data.url;
    } else {
      alert(data?.error || "Could not create checkout session.");
    }
    setLoading(false);
  }
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Take Payment</Text>
      <Text style={{ opacity: 0.7 }}>Redirects to Stripe Checkout (Test mode recommended)</Text>

      <View style={{ gap: 6 }}>
        <Text>Deposit Amount (USD)</Text>
        <TextInput
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
          placeholder="e.g., 30.00"
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text>Booking ID (optional)</Text>
        <TextInput
          value={bookingId}
          onChangeText={setBookingId}
          style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 10 }}
          placeholder="Paste an existing booking UUID"
        />
      </View>

      <Pressable
        disabled={loading}
        onPress={goToCheckout}
        style={{ backgroundColor: "#c6b1e6", padding: 12, borderRadius: 12, opacity: loading ? 0.6 : 1 }}
      >
        <Text style={{ textAlign: "center", fontWeight: "600", color: "#1a1a1f" }}>
          {loading ? "Creating..." : "Open Checkout"}
        </Text>
      </Pressable>
    </View>
  );
}
