"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export type Budget = {
  id: string;
  title: string;
  amount_total: number;
  status: "draft" | "presentado" | "aceptado" | "rechazado" | "en_revision";
  currency: string;
  pdf_url: string;
  created_at: string;
  leads: {
    name: string;
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
          id,
          title,
          status,
          currency,
          amount_total,
          pdf_url,
          created_at,
          leads (
            name,
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
        .neq("status", "draft")
        .neq("status", "rechazado");

      if (error) throw error;
      return data as Budget[];
    },
  });
}
