"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useClientProject() {
  return useQuery({
    queryKey: ["useClientProject"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projects")
        .select(
          "id, title, profiles(nombre), presupuestos(id, monto, estado, divisa)"
        );

      if (error) throw error;

      return data.map((project) => ({
        ...project,
        presupuesto: project.presupuestos?.[0] || null,
      }));
    },
  });
}
