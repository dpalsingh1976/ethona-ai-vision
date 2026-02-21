import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  orgId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  orgId: null,
  loading: true,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function resolveOrgId(userId: string) {
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const { data, error } = await supabase
          .from("org_members")
          .select("org_id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();

        if (data?.org_id) {
          return data.org_id;
        }
      } catch (e) {
        console.error("[Auth] org query exception:", e);
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    return null;
  }

  useEffect(() => {
    let isMounted = true;

    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn("[Auth] Loading timed out");
        setLoading(false);
      }
    }, 10000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(async () => {
            if (!isMounted) return;
            const org = await resolveOrgId(newSession.user.id);
            if (isMounted) {
              setOrgId(org);
              setLoading(false);
            }
          }, 0);
        } else {
          setOrgId(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!isMounted) return;
      if (!s) {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setOrgId(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, orgId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
