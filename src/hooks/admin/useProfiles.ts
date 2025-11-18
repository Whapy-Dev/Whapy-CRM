"use client";

import { Client } from "@/app/crm/usuarios/page";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useProfiles() {
  return useQuery<Client[]>({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          *,
          pasos(*),
          projects:projects(
            *,
            videos(*),
            documents(*),
            all_meetings(
              *,
              videos(*)
            )
          ),
          budgets(*)
        `
        )
        .eq("role", "cliente");

      if (error) throw error;
      return data as unknown as Client[];
    },
  });
}
