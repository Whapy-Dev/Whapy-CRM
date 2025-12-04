"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useClientProject() {
  return useQuery({
    queryKey: ["useClientroject"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id, title, profile(nombre)");

      if (error) throw error;
      return data;
    },
  });
}
