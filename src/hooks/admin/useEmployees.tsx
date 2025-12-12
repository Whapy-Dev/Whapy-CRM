"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useEmplooyes() {
  return useQuery({
    queryKey: ["useProfilesEmployees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre, roles(rol)")
        .eq("role", "admin");

      if (error) throw error;
      return data;
    },
  });
}
