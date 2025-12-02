import dayjs from "dayjs";
import Constants from "expo-constants";

export function useToday() {
  return dayjs().format("ddd, MMM D");
}

export function useConstants() {
  const extra = (Constants.expoConfig?.extra as any) || {};
  return {
    stripePublishableKey: extra.stripePublishableKey,
    supabaseUrl: extra.supabaseUrl,
    supabaseAnonKey: extra.supabaseAnonKey,
    apiBaseUrl: extra.apiBaseUrl,
  };
}
