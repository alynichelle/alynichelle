import { Drawer } from "expo-router/drawer";
import { Pressable, Text } from "react-native";
import { useAuth } from "../../lib/auth";
import { useTheme } from "../../lib/theme";

export default function DrawerLayout() {
  const { signOut } = useAuth();
  const t = useTheme();
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: t.colors.bg },
        headerTitleStyle: { fontWeight: "600", color: t.colors.text },
        drawerActiveBackgroundColor: t.colors.primary,
        drawerActiveTintColor: t.colors.onPrimary,
      }}
    >
      <Drawer.Screen name="provider/profile" options={{ title: "Provider Profile" }} />
      <Drawer.Screen name="calendar/index" options={{ title: "Calendar" }} />
      <Drawer.Screen name="index" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="booking" options={{ title: "Bookings" }} />
      <Drawer.Screen name="bookings/[id]" options={{ title: "Booking", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="clients/index" options={{ title: "Clients" }} />
      <Drawer.Screen name="clients/[id]" options={{ title: "Client" }} />
      <Drawer.Screen name="clients/[id]/billing" options={{ title: "Billing", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="clients/[id]/forms" options={{ title: "Forms", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="clients/[id]/files" options={{ title: "Files", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="clients/[id]/book" options={{ title: "Book", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="inventory" options={{ title: "Inventory" }} />
      <Drawer.Screen name="payments/index" options={{ title: "Invoices" }} />
      <Drawer.Screen name="payments/checkout" options={{ title: "Payments" }} />
      <Drawer.Screen name="payments/invoice/[id]" options={{ title: "Invoice", drawerItemStyle: { display: "none" } }} />
      <Drawer.Screen name="payments/coupons" options={{ title: "Coupons" }} />
      <Drawer.Screen name="payments/disputes" options={{ title: "Disputes" }} />
      <Drawer.Screen name="settings_plugins" options={{ title: "Plugins" }} />
      <Drawer.Screen
        name="settings"
        options={{
          title: "Settings",
          headerRight: () => (
            <Pressable onPress={signOut} style={{ marginRight: 12 }}>
              <Text style={{ fontWeight: "600" }}>Logout</Text>
            </Pressable>
          ),
        }}
      />
    </Drawer>
  );
}
