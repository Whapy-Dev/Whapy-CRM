"use client";

import { Client } from "@/app/crm/usuarios/page";
import { createClient } from "@/lib/supabase/client";
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
          projects:projects!left(
            status,
            presupuestos!left(
              *,
              presupuestos_employees!left(
                profiles(id, nombre)
              )
            )
          )
        `
        )
        .eq("role", "cliente")
        .eq("has_access_project", "0");

      if (error) throw error;

      // Transformamos cada project para que tenga un solo presupuesto como objeto
      const profilesTransformados = data.map((client) => ({
        ...client,
        projects: (client.projects ?? []).map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (project: any) => {
            const pre = project.presupuestos?.[0] ?? null;
            return {
              ...project,
              presupuestos: undefined, // eliminamos el array original
              presupuesto: pre
                ? {
                    ...pre,
                    // aseguramos que presupuestos_employees siempre sea un array
                    presupuestos_employees: pre.presupuestos_employees ?? [],
                  }
                : null,
            };
          }
        ),
      }));

      return profilesTransformados as Client[];
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
              presupuestos!left(
                *,
                presupuestos_employees!left(
                  profiles(id, nombre)
                )
              )
            )
          ),
          budgets(*)
        `
        )
        .eq("id", clientId);

      if (error) throw error;

      const dataTransformada: Client[] = data.map((client) => ({
        ...client,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        project_users: client.project_users?.map((pu: any) => {
          if (!pu.project) return { ...pu, project: null };

          const pre = pu.project.presupuestos?.[0] ?? null;

          return {
            ...pu,
            project: {
              ...pu.project,
              presupuestos: undefined, // eliminamos array original
              presupuesto: pre
                ? {
                    ...pre,
                    presupuestos_employees: pre.presupuestos_employees ?? [],
                  }
                : null,
            },
          };
        }),
      }));

      return dataTransformada;
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
