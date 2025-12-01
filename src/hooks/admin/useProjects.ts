import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export type ProjectWithProfiles = {
  id: string;
  title: string;
  progress: number;
  status: string;
  created_at: string;
  profiles: ProfileInProject[];
};

export type ProfileInProject = {
  id: string;
  nombre: string;
  role_id: string | null;
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
