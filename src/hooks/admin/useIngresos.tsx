"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useIngresos() {
  return useQuery({
    queryKey: ["useIngresos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Ingresos")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}
