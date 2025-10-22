"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useBudgetsUser() {
  return useQuery({
    queryKey: ["budgetsUser"],
    queryFn: async () => {
      const {
        data: { user },
        error: errorUser,
      } = await supabase.auth.getUser();

      if (errorUser) throw errorUser;
      if (!user) return [];

      // Traemos los leads del usuario
      const { data: dataLead, error: errorLead } = await supabase
        .from("leads")
        .select("*")
        .neq("status", "draft")
        .neq("status", "rechazado")
        .eq("email", user.email);

      if (errorLead) throw errorLead;

      if (!dataLead || dataLead.length === 0) return [];

      const { data: dataBudgets, error: errorBudgets } = await supabase
        .from("budgets")
        .select("*")
        .eq("lead_id", dataLead[0].id);

      if (errorBudgets) throw errorBudgets;

      return dataBudgets || [];
    },
  });
}
