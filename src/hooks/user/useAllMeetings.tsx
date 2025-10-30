// src/hooks/user/useMeetings.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

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

export function useAllMeetingsByProjectId(projectId: string) {
  return useQuery({
    queryKey: ["allMeetingsByProjectId", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("all_meetings")
        .select("*, leads(name), profiles(nombre), projects!inner(title)")
        .eq("project_id", projectId)
        .order("start_at", { ascending: true });
      if (error) throw error;
      return data as Meeting[];
    },
  });
}

export function useAllMeetingsUser() {
  return useQuery({
    queryKey: ["AllMeetingsUser"],
    queryFn: async () => {
      const {
        data: { user },
        error: errorUser,
      } = await supabase.auth.getUser();

      if (errorUser) throw errorUser;
      if (!user) return null;

      const { data, error } = await supabase
        .from("all_meetings")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
  });
}
