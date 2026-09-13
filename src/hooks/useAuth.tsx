import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const ADMIN_EMAILS = [
  "shinhasarder2343@gmail.com",
  "mdshinhasarder466@gmail.com",
];

const Ctx = createContext<AuthCtx>({ user: null, session: null, isAdmin: false, loading: true, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAdmin = async (u: User) => {
      const email = (u.email || "").toLowerCase().trim();
      if (ADMIN_EMAILS.includes(email)) return true;
      if (u.app_metadata?.role === "admin" || u.user_metadata?.role === "admin") return true;

      try {
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", u.id)
          .eq("role", "admin")
          .maybeSingle();
        if (!error && data) return true;
      } catch (_e) {
        void _e;
      }
      return false;
    };

    const applySession = async (s: Session | null) => {
      if (!mounted) return;
      setLoading(true);
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      const admin = await checkAdmin(s.user).catch(() => false);
      if (!mounted) return;
      setIsAdmin(admin);
      setLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      void applySession(s);
    });
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        const { data: verified, error } = await supabase.auth.getUser();
        if (error || !verified.user) {
          await supabase.auth.signOut();
          await applySession(null);
          return;
        }
        await applySession({ ...data.session, user: verified.user });
      } else {
        await applySession(null);
      }
    }).catch(() => {
      void applySession(null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return <Ctx.Provider value={{ user, session, isAdmin, loading, signOut: async () => { await supabase.auth.signOut(); setSession(null); setUser(null); setIsAdmin(false); } }}>{children}</Ctx.Provider>;
};

export const useAuth = () => useContext(Ctx);
