"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useEgresos() {
  return useQuery({
    queryKey: ["useEgresos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("Egresos")
        .select("*,profiles!left(nombre)")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
