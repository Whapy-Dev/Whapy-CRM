"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

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
};

export function useAllMeetings() {
  return useQuery({
    queryKey: ["allMeetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("all_meetings")
        .select("*, leads(name), profiles(nombre)");

      if (error) throw error;
      return data;
    },
  });
}

export function useAllMeetingsUltimateWeek() {
  return useQuery({
    queryKey: ["allMeetingsUltimateWeek"],
    queryFn: async () => {
      const fechaHace30Dias = new Date();
      fechaHace30Dias.setDate(fechaHace30Dias.getDate() - 30);

      const { data, error } = await supabase
        .from("all_meetings")
        .select("*, leads(name), profiles(nombre)")
        .gte("created_at", fechaHace30Dias.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useAllMeetingsFromToday() {
  return useQuery({
    queryKey: ["allMeetingsFromToday"],
    queryFn: async () => {
      const hoy = new Date();

      const { data, error } = await supabase
        .from("all_meetings")
        .select("*, leads(name), profiles(nombre)")
        .gte("start_at", hoy.toISOString())
        .order("start_at", { ascending: true });
      if (error) throw error;
      return data as Meeting[];
    },
  });
}
