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
        .select("*,projects(title)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
