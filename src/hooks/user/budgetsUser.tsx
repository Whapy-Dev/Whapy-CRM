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
      const { data: dataUsers, error: errorUsers } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id);

      if (errorUsers) throw errorUsers;

      if (!dataUsers || dataUsers.length === 0) return [];

      const { data: dataBudgets, error: errorBudgets } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", dataUsers[0].id);

      if (errorBudgets) throw errorBudgets;

      return dataBudgets || [];
    },
  });
}
