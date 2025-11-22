"use client";

import { createClient } from "@/lib/supabase/client";
import { Client } from "@/utils/types";
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

export function useProfileById(clientId: string) {
  return useQuery<Client[]>({
    queryKey: ["profileById", clientId],
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
        .eq("id", clientId);

      if (error) throw error;
      return data as unknown as Client[];
    },
  });
}
