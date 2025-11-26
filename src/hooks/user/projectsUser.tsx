import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Project, Document, Video } from "@/utils/types";
import { User } from "@supabase/supabase-js";

export type ProjectRow = {
  project: Project;
  documents: Document[];
  videos: Video[];
};

export function useProjectsUser(user: User | null) {
  return useQuery({
    queryKey: ["projectsUser", user?.id],

    queryFn: async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("project_users")
        .select(`project:projects(*, videos(*), documents(*))`)
        .eq("user_id", user?.id);

      if (error) throw error;

      if (!data) return [];

      // 🔥 Normalizamos la respuesta a ProjectRow[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized: ProjectRow[] = data.map((row: any) => ({
        project: {
          ...row.project,
        },
        documents: row.project.documents || [],
        videos: row.project.videos || [],
      }));

      return normalized;
    },

    enabled: !!user,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });
}
