// src/hooks/user/useMeetings.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export function useMeetingsByProjectUser(projectId: string) {
  return useQuery({
    queryKey: ["meetingsByProject", projectId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("meetings_projects")
        .select("*, projects(title)")
        .eq("project_id", projectId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!projectId,
  });
}

export function useMeetingsUser() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const {
        data: { user },
        error: errorUser,
      } = await supabase.auth.getUser();

      if (errorUser) throw errorUser;
      if (!user) return null;

      const { data, error } = await supabase
        .from("meetings_projects")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data || [];
    },
  });
}
