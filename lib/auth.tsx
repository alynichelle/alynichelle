import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

type SessionLike = Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"];

const AuthCtx = createContext<{
  session: SessionLike;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}>({ session: null, loading: true, signIn: async () => null, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<SessionLike>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) setSession(data.session);
      setLoading(false);
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      sub.subscription.unsubscribe();
      mounted = false;
    };
  }, []);

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }
  async function signOut() {
    await supabase.auth.signOut();
  }

  return <AuthCtx.Provider value={{ session, loading, signIn, signOut }}>{children}</AuthCtx.Provider>;
}
export function useAuth() {
  return useContext(AuthCtx);
}
