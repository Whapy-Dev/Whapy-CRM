"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useDatosUser() {
  return useQuery({
    queryKey: ["datosUser"],
    queryFn: async () => {
      const {
        data: { user },
        error: errorUser,
      } = await supabase.auth.getUser();

      if (errorUser) throw errorUser;
      if (!user) return null;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });
}
