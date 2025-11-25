"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * VERSIÓN MINIMALISTA - GARANTIZADO NO SE QUEDA EN LOADING
 *
 * - Timeout de 5 segundos FORZADO
 * - Logs extensivos para debugging
 * - Try-catch en todo
 * - Sin dependencias extras
 */

type UserRole = "admin" | "cliente" | null;

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [roleAdmin, setRoleAdmin] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // TIMEOUT FORZADO - GARANTIZA QUE LOADING SE PONE EN FALSE
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 5000); // 5 segundos

    const init = async () => {
      try {
        const supabase = createClient();

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("🔴 [AUTH] Error en sesión:", sessionError);
          clearTimeout(timeoutId);
          if (isMounted) setLoading(false);
          return;
        }

        if (!session) {
          clearTimeout(timeoutId);
          if (isMounted) setLoading(false);
          return;
        }

        // Establecer usuario inmediatamente
        if (isMounted) {
          setUser(session.user);
          setName(session.user.email?.split("@")[0] || "Usuario");
        }

        // Intentar obtener perfil (pero no es crítico)

        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, nombre, roles(rol)")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.warn(
              "⚠️ [AUTH] Error en perfil (no crítico):",
              profileError.message
            );
            // Usar rol por defecto
            if (isMounted) {
              setRole("cliente");
            }
          } else {
            if (isMounted) {
              setRole(profile?.role || "cliente");
              setName(
                profile?.nombre ||
                  session.user.email?.split("@")[0] ||
                  "Usuario"
              );
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              setRoleAdmin(profile?.roles?.rol || null);
            }
          }
        } catch (profileError) {
          console.warn("⚠️ [AUTH] Exception en perfil:", profileError);
          if (isMounted) {
            setRole("cliente");
          }
        }

        // Limpiar timeout y establecer loading false
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("🔴 [AUTH] Error general:", error.message);
        } else {
          console.error("🔴 [AUTH] Error desconocido:", error);
        }

        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    init();

    // Cleanup
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Sin dependencias

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setRole(null);
      setName(null);
      window.location.href = "/login";
    } catch (error) {
      console.error("🔴 [AUTH] Error al cerrar sesión:", error);
      // Forzar redirección de todas formas
      window.location.href = "/login";
    }
  };

  return {
    user,
    roleAdmin,
    role,
    name,
    loading,
    isAdmin: role === "admin",
    isCliente: role === "cliente",
    signOut,
  };
}
