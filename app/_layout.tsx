import { Stack } from "expo-router";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useConstants } from "../lib/utils";

export default function RootLayout() {
  const { stripePublishableKey } = useConstants();
  return (
    <StripeProvider publishableKey={stripePublishableKey || ""}>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#ffffff" },
          headerTitleStyle: { fontWeight: "600" },
        }}
      >
        <Stack.Screen name="index" options={{ title: "Dashboard" }} />
        <Stack.Screen name="booking" options={{ title: "Book" }} />
        <Stack.Screen name="inventory" options={{ title: "Inventory" }} />
        <Stack.Screen name="clients/index" options={{ title: "Clients" }} />
        <Stack.Screen name="clients/[id]" options={{ title: "Client" }} />
        <Stack.Screen name="payments/checkout" options={{ title: "Checkout" }} />
      </Stack>
    </StripeProvider>
  );
}
