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
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🟦 [AUTH] Iniciando...");

    let isMounted = true;

    // TIMEOUT FORZADO - GARANTIZA QUE LOADING SE PONE EN FALSE
    const timeoutId = setTimeout(() => {
      console.log("🔴 [AUTH] TIMEOUT de 5 segundos alcanzado");
      if (isMounted) {
        setLoading(false);
        console.log("🔴 [AUTH] Loading establecido a FALSE por timeout");
      }
    }, 5000); // 5 segundos

    const init = async () => {
      try {
        console.log("🟦 [AUTH] Creando cliente Supabase...");
        const supabase = createClient();

        console.log("🟦 [AUTH] Obteniendo sesión...");
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
          console.log("⚪ [AUTH] No hay sesión");
          clearTimeout(timeoutId);
          if (isMounted) setLoading(false);
          return;
        }

        console.log("🟢 [AUTH] Sesión encontrada:", session.user.email);

        // Establecer usuario inmediatamente
        if (isMounted) {
          setUser(session.user);
          setName(session.user.email?.split("@")[0] || "Usuario");
        }

        // Intentar obtener perfil (pero no es crítico)
        console.log("🟦 [AUTH] Obteniendo perfil...");
        try {
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role, nombre")
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
            console.log("🟢 [AUTH] Perfil cargado:", profile);
            if (isMounted) {
              setRole(profile?.role || "cliente");
              setName(
                profile?.nombre ||
                  session.user.email?.split("@")[0] ||
                  "Usuario"
              );
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
          console.log("🟢 [AUTH] Completado exitosamente");
        }
      } catch (error: any) {
        console.error("🔴 [AUTH] Error general:", error);
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    init();

    // Cleanup
    return () => {
      console.log("🟦 [AUTH] Cleanup");
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, []); // Sin dependencias

  const signOut = async () => {
    console.log("🟦 [AUTH] Cerrando sesión...");
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

  // Debug: Log del estado actual cada vez que cambia
  useEffect(() => {
    console.log("📊 [AUTH] Estado actual:", {
      loading,
      hasUser: !!user,
      role,
      name,
    });
  }, [loading, user, role, name]);

  return {
    user,
    role,
    name,
    loading,
    isAdmin: role === "admin",
    isCliente: role === "cliente",
    signOut,
  };
}
