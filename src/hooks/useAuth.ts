"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

type UserRole = "admin" | "cliente" | null;

interface AuthState {
  user: User | null;
  role: UserRole;
  name: string | null;
  loading: boolean;
}

export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    name: null,
    loading: true,
  });

  useEffect(() => {
    const supabase = createClient();
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
            .select("role, nombre")
            .eq("id", user.id)
            .single();

          if (profileError) console.error(profileError);

          if (mounted) {
            setAuthState({
              user,
              role: profile?.role || null,
              name:
                profile?.nombre ||
                user.user_metadata?.nombre ||
                user.email?.split("@")[0] ||
                "Usuario",
              loading: false,
            });
          }
        } else {
          if (mounted) {
            setAuthState({
              user: null,
              role: null,
              name: null,
              loading: false,
            });
          }
        }
      } catch (err) {
        console.error("Error al obtener usuario:", err);
        if (mounted) {
          setAuthState({ user: null, role: null, name: null, loading: false });
        }
      }
    };

    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        const user = session?.user || null;

        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, nombre")
            .eq("id", user.id)
            .single();

          if (mounted) {
            setAuthState({
              user,
              role: profile?.role || null,
              name:
                profile?.nombre ||
                user.user_metadata?.nombre ||
                user.email?.split("@")[0] ||
                "Usuario",
              loading: false,
            });
          }
        } else {
          if (mounted) {
            setAuthState({
              user: null,
              role: null,
              name: null,
              loading: false,
            });
          }
        }

        if (event === "SIGNED_IN") {
          router.refresh();
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  const signOut = async () => {
    const supabase = createClient();
    try {
      // Primero hacer signOut en Supabase
      await supabase.auth.signOut();

      // Limpiar estado local
      setAuthState({ user: null, role: null, name: null, loading: false });

      // Usar window.location para forzar una recarga completa
      // Esto asegura que el middleware procese correctamente el logout
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Incluso si hay error, intentar redirigir
      window.location.href = "/login";
    }
  };

  return {
    user: authState.user,
    role: authState.role,
    name: authState.name,
    loading: authState.loading,
    isAdmin: authState.role === "admin",
    isCliente: authState.role === "cliente",
    signOut,
  };
}
