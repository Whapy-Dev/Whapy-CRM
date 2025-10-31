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
  profiles:
    | {
        nombre: string;
        created_at: string;
      }[]
    | null;
};

export function useBudgets() {
  return useQuery({
    queryKey: ["budgets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select(
          `
          id,
          title,
          status,
          currency,
          amount_total,
          pdf_url,
          created_at,
          profiles (
            nombre,
            created_at
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Budget[];
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
      return data as Budget[];
    },
  });
}
