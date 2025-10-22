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
    // Obtener usuario actual
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Obtener rol del usuario
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        setAuthState({
          user,
          role: profile?.role || null,
          loading: false,
        });
      } else {
        setAuthState({
          user: null,
          role: null,
          loading: false,
        });
      }
    };

    getUser();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          setAuthState({
            user: session.user,
            role: profile?.role || null,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            role: null,
            loading: false,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClient();
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
