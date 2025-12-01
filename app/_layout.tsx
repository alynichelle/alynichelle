import { Stack, Redirect, usePathname } from "expo-router";
import { StripeProvider } from "@stripe/stripe-react-native";
import { useConstants } from "../lib/utils";
import { AuthProvider, useAuth } from "../lib/auth";
import { ThemeProvider, useTheme } from "../lib/theme";

function ProtectedStack() {
  const { session, loading } = useAuth();
  const path = usePathname();
  const t = useTheme();
  const isAuthScreen = path?.startsWith("/sign-in");
  const isPublic = isAuthScreen || path?.startsWith("/client");
  if (loading) return null;
  if (!session && !isPublic) return <Redirect href="/sign-in" />;
  if (session && isAuthScreen) return <Redirect href="/" />;
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.bg },
        headerTitleStyle: { fontWeight: "600", color: t.colors.text },
      }}
    >
      <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ title: "Sign in" }} />
      <Stack.Screen name="success" options={{ title: "Success" }} />
      <Stack.Screen name="cancel" options={{ title: "Canceled" }} />
      <Stack.Screen name="client/booking/[id]/pay" options={{ title: "Pay" }} />
      <Stack.Screen name="client/booking/[id]/cancel" options={{ title: "Cancel" }} />
      <Stack.Screen name="client/upcoming/[client_id]" options={{ title: "Upcoming" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const { stripePublishableKey } = useConstants();
  return (
    <ThemeProvider>
      <StripeProvider publishableKey={stripePublishableKey || ""}>
        <AuthProvider>
          <ProtectedStack />
        </AuthProvider>
      </StripeProvider>
    </ThemeProvider>
  );
}
