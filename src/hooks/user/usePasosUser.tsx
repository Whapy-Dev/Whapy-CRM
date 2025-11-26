"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

export function usePasosUser(user: User | null) {
  return useQuery({
    queryKey: ["pasosUser", user?.id],
    queryFn: async () => {
      const { data: dataPasos, error: errorPasos } = await supabase
        .from("pasos")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (errorPasos) throw errorPasos;

      return dataPasos || [];
    },
    enabled: !!user,
  });
}
