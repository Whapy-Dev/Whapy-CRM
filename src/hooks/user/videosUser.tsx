import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

type Video = {
  id: string;
  meeting_id: string;
  project_id: string;
  vimeo_id: string;
  vimeo_url: string;
  title: string;
  status: string;
  descripcion: string;
  duration: string;
  created_at: string;
};

const supabase = createClient();
export function useVideosByProjectId(projectId: string) {
  return useQuery({
    queryKey: ["videosByProjectId", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Video[];
    },
  });
}
