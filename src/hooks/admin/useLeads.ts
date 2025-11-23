"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useLeadsLead() {
  return useQuery({
    queryKey: ["leadsLead"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useLeadsRecent() {
  return useQuery({
    queryKey: ["leadsRecent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("type", "Lead")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });
}

export function useLeadsUltimateMonth() {
  return useQuery({
    queryKey: ["leadsUltimateMonth"],
    queryFn: async () => {
      const fechaHace30Dias = new Date();
      fechaHace30Dias.setDate(fechaHace30Dias.getDate() - 30);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("type", "Lead")
        .gte("created_at", fechaHace30Dias.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}
