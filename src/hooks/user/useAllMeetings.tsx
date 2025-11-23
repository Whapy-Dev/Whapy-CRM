"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

type Lead = {
  name: string;
};

type Profile = {
  nombre: string;
};

export type Meeting = {
  meeting_id: string;
  project_id: string;
  lead_id: string;
  user_id: string;
  type_meeting: string;
  title: string;
  start_at: string;
  location: string;
  meet_url?: string;
  summary_md: string;
  summary_pdf_url: string;
  created_at: string;
  estado: string;
  leads?: Lead;
  profiles?: Profile;
  duration: string;
  projects: { title: string } | null;
};

export function useMeetingsByProjectId(projectId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["meetingsByProjectId", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*, projects(title)")
        .eq("project_id", projectId)
        .eq("type_video", "Reunion")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
  });
}
