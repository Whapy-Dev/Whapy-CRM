"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          projects:projects(
            *,
            documents(*),
            all_meetings(*)
            )
            budgets(*)
        `
        )
        .eq("role", "cliente");

      if (error) throw error;
      return data;
    },
  });
}
