"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useClientLinks() {
  return useQuery({
    queryKey: ["clientLinks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("client_links").select("*");

      if (error) throw error;
      return data;
    },
  });
}
