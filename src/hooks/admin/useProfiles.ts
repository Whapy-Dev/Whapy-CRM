"use client";

import { createClient } from "@/lib/supabase/client";
import { Client } from "@/utils/types";
import { useQuery } from "@tanstack/react-query";
export type Secundario = {
  type: "Secundario";
  profile: {
    id: string;
    nombre: string;
    email: string;
  };
  project_id: string;
  project_title: string;
};

type ProjectUserRow = {
  type: string;
  profile: {
    id: string;
    nombre: string;
    email: string | null;
  };
  project_id: string;
  project: { title: string }[];
};
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
          projects!left(status, presupuestos(*, profiles(nombre)))
        `
        )
        .eq("role", "cliente")
        .eq("has_access_project", "0");

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
          project_users!left(
            project:projects(
              *,
              videos(*),
              documents(*),
              presupuestos(*, profiles(nombre))
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

export const useSecundarios = (projectIds: string[]) => {
  return useQuery({
    queryKey: ["secundarios", projectIds],
    queryFn: async () => {
      if (!projectIds || projectIds.length === 0) return [];

      const { data, error } = await supabase
        .from("project_users")
        .select(
          `
          type,
          profile:profiles(id,nombre,email),
          project_id,
          project:projects(title)
        `
        )
        .in("project_id", projectIds)
        .eq("type", "Secundario");

      if (error) throw error;

      return data;
    },
    enabled: projectIds.length > 0,
  });
};
