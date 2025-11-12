"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";

export function useDatosUser(user: User | null) {
  return useQuery({
    queryKey: ["datosUser", user?.id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
    retry: 3, // Reintentar 3 veces si falla
    retryDelay: 1000, // Esperar 1 segundo entre reintentos
    staleTime: 5 * 60 * 1000, // Los datos son válidos por 5 minutos
  });
}
