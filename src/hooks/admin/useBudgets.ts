"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export type Budget = {
  id: string;
  divisa: string;
  monto: number;
  estado: "En revisión" | "Aceptado" | "Rechazado";
  project_id: string;
  created_at: string;
};

export function usePresupuestos() {
  return useQuery({
    queryKey: ["presupuestos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("presupuestos").select("*");

      if (error) throw error;
      return data;
    },
  });
}

export function useBudgetsActive() {
  return useQuery({
    queryKey: ["budgetsActive"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .neq("status", "en revision")
        .neq("status", "rechazado");

      if (error) throw error;
      return data;
    },
  });
}
