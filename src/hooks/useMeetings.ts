"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("meetings").select("*");

      if (error) throw error;
      return data;
    },
  });
}
