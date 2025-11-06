"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@supabase/supabase-js";

const supabase = createClient();

export function useBudgetsUser(user: User | null) {
  return useQuery({
    queryKey: ["budgetsUser", user?.id],
    queryFn: async () => {
      const { data: dataBudgets, error: errorBudgets } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user?.id);

      if (errorBudgets) throw errorBudgets;

      return dataBudgets || [];
    },
    enabled: !!user,
  });
}
