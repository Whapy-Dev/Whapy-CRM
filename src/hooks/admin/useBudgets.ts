"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export type Budget = {
  id: string;
  title: string;
  amount_total: number;
  status: "presentado" | "aceptado" | "rechazado" | "en revision";
  currency: string;
  pdf_url: string;
  created_at: string;
  duracion_estimada: string;
  modalidad_pago: string;
  profiles: {
    nombre: string;
    created_at: string;
  } | null;
};

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select(
          `
          *,
          profiles (
            nombre,
            created_at
          )
        `
        )
        .order("created_at", { ascending: false });

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
