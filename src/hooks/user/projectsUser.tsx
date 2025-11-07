"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

export function useProjectsUser(user: User | null) {
  return useQuery({
    queryKey: ["projectsUser", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(`*, all_meetings!left(*), documents(*)`)
        .eq("user_id", user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}
