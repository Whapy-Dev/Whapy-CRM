"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export type Documents = {
  id: string;
  project_id: string;
  lead_id?: string | null; // este sí puede ser opcional o null
  user_id: string;
  title: string;
  document_url: string;
  category_document: string;
  type_document: string;
  created_at: string;
  projects: {
    title: string;
  } | null;
};

export function useDocumentsByProjectId(projectId: string) {
  return useQuery({
    queryKey: ["allDocumentsByProjectId", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*, projects(title)")
        .eq("project_id", projectId);
      if (error) throw error;
      return data as Documents[];
    },
  });
}
