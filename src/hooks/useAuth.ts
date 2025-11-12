"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js";

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

    const loadUser = async (session: Session | null, source: string) => {
      console.log(`🟩 loadUser desde: ${source}`);

      const user = session?.user || null;

      if (!user) {
        console.log("🚫 No hay usuario logueado");
        if (mounted) {
          setAuthState({ user: null, role: null, name: null, loading: false });
        }
        return;
      }

      console.log("✅ Usuario autenticado:", user.email);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, nombre")
        .eq("id", user.id)
        .single();

      if (error) console.error("⚠️ Error al obtener perfil:", error);
      console.log("📄 Perfil obtenido:", profile);

      if (mounted) {
        setAuthState({
          user,
          role: profile?.role || "cliente",
          name:
            profile?.nombre ||
            user.user_metadata?.nombre ||
            user.email?.split("@")[0] ||
            "Usuario",
          loading: false,
        });
      }
    };

    const init = async () => {
      console.log("🟦 Iniciando fetchUser inicial...");
      const {
        data: { session },
      } = await supabase.auth.getSession();

      await loadUser(session, "INIT");

      // Listener para cambios de auth (login/logout)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(
        async (event: AuthChangeEvent, session: Session | null) => {
          console.log("🔄 Cambio de estado de auth:", event);
          if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            await loadUser(session, event);
          } else if (event === "SIGNED_OUT") {
            setAuthState({
              user: null,
              role: null,
              name: null,
              loading: false,
            });
          }
        }
      );

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    };

    init();
  }, [router]);

  const signOut = async () => {
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      setAuthState({ user: null, role: null, name: null, loading: false });
      window.location.href = "/login";
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
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
