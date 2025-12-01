import { View, Text, Pressable } from "react-native";
import { useConstants } from "../../lib/utils";
import { startPaymentIntent } from "../../services/booking";

// MVP: For Web use Stripe Checkout via your server webhook.
// In native, you'd present a PaymentSheet; here we stub the intent call.
export default function Checkout() {
  const { stripePublishableKey } = useConstants();
  async function createIntent() {
    // Call your serverless function to create PaymentIntent + return client_secret
    // For now we just show guidance.
    alert("Wire this to your serverless endpoint that returns a Stripe Checkout url or PaymentIntent client_secret.");
  }
  return (
    <View style={{ gap: 12, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Take Payment</Text>
      <Text style={{ opacity: 0.7 }}>Stripe key loaded: {stripePublishableKey ? "yes" : "no"}</Text>
      <Pressable onPress={createIntent} style={{ backgroundColor:"#c6b1e6", padding:12, borderRadius:12 }}>
        <Text style={{ textAlign:"center", fontWeight:"600", color:"#1a1a1f" }}>Create Payment Intent</Text>
      </Pressable>
    </View>
  );
}
