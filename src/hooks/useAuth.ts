import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

type UserRole = "admin" | "cliente" | null;

const supabase = createClient();

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        const user = session?.user || null;

        if (user) {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (profileError) console.error(profileError);

          if (mounted) {
            setAuthState({
              user,
              role: profile?.role || null,
              loading: false,
            });
          }
        } else {
          if (mounted) {
            setAuthState({
              user: null,
              role: null,
              loading: false,
            });
          }
        }
      } catch (err) {
        console.error("Error al obtener usuario:", err);
        if (mounted) {
          setAuthState({ user: null, role: null, loading: false });
        }
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const user = session?.user || null;
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

          if (mounted) {
            setAuthState({
              user,
              role: profile?.role || null,
              loading: false,
            });
          }
        } else {
          if (mounted) {
            setAuthState({
              user: null,
              role: null,
              loading: false,
            });
          }
        }
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return {
    user: authState.user,
    role: authState.role,
    loading: authState.loading,
    isAdmin: authState.role === "admin",
    isCliente: authState.role === "cliente",
    signOut,
  };
}
