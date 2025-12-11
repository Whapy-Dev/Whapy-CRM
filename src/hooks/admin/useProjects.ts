import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type ProjectWithProfiles = {
  id: string;
  title: string;
  progress: number;
  status: "En progreso" | "Terminado" | "Cancelado" | "Pausado" | string;
  created_at: string;
  descripcion: string;
  user_id: string;
  profiles: ProfileInProject[];
};

export type ProfileInProject = {
  id: string;
  nombre: string;
  role_id: string | null;
  descripcion: string;
  user_id: string;
};

const supabase = createClient();

export function useProjects() {
  return useQuery<ProjectWithProfiles[]>({
    queryKey: ["projectEmlooyes"],
    queryFn: async (): Promise<ProjectWithProfiles[]> => {
      const { data, error } = await supabase
        .from("project_emplooyes")
        .select(
          "*, projects(id, title, progress, status, created_at), profiles(id, nombre, telefono, roles(rol))"
        );

      if (error) throw error;
      if (!data) return [];

      const grouped = data.reduce<Record<string, ProjectWithProfiles>>(
        (acc, row) => {
          const project = row.projects;
          const profile = row.profiles;

          // Si el proyecto no existe, lo inicializamos
          if (!acc[project.id]) {
            acc[project.id] = {
              id: project.id,
              title: project.title,
              progress: project.progress,
              status: project.status,
              created_at: row.created_at,
              descripcion: project.descripcion ?? "",
              user_id: project.user_id ?? "",
              profiles: [],
            };
          }

          // Evitar duplicados
          const exists = acc[project.id].profiles.some(
            (p) => p.id === profile.id
          );

          // Agregar profile al proyecto
          if (!exists) {
            acc[project.id].profiles.push(profile);
          }

          return acc;
        },
        {}
      );

      return Object.values(grouped);
    },
  });
}

export function useProjectById(projectId: string) {
  return useQuery<ProjectWithProfiles[]>({
    queryKey: ["projectEmlooyes", projectId],
    queryFn: async (): Promise<ProjectWithProfiles[]> => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          `
    *,
    client:profiles!user_id(id, nombre, email, empresa),
    project_emplooyes(
      profiles(id, nombre, telefono, roles(rol))
    ),
    project_phases(
      *,
      phase_tasks(
        *,
        assigned:profiles!assigned_to(id, nombre)
      )
    )
  `
        )
        .eq("id", projectId)
        .order("orden", { referencedTable: "project_phases", ascending: true })
        .maybeSingle();

      if (error) throw error;
      if (!data) return [];

      return data;
    },
  });
}
