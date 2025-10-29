"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useProjectsUser() {
  return useQuery({
    queryKey: ["projectsUser"],
    queryFn: async () => {
      const {
        data: { user },
        error: errorUser,
      } = await supabase.auth.getUser();

      if (errorUser) throw errorUser;
      if (!user) {
        console.log("No hay usuario logueado");
        return [];
      }

      const { data, error } = await supabase
        .from("projects")
        .select(`*, all_meetings!left(*), documents(*)`)
        .eq("user_id", user.id);
      if (error) throw error;
      return data;
    },
  });
}
