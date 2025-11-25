"use client";

import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

const supabase = createClient();

export function useActividadLogs({
  page,
  limit,
  filtroFecha,
  filtroSeccion,
  filtroModificador,
  filtroModificado,
}: {
  page: number;
  limit: number;
  filtroFecha: string;
  filtroSeccion: string;
  filtroModificador: string;
  filtroModificado: string;
}) {
  return useQuery({
    queryKey: [
      "actividadLogs",
      page,
      limit,
      filtroFecha,
      filtroSeccion,
      filtroModificador,
      filtroModificado,
    ],

    queryFn: async () => {
      let query = supabase
        .from("historial_actividad")
        .select(
          `
          id,
          fecha,
          accion,
          usuario_modificado,
          seccion,
          usuario_modificador_id:profiles (
            id,
            nombre
          )
        `,
          { count: "exact" }
        )
        .order("fecha", { ascending: false });

      // FILTROS **EN EL BACKEND**
      if (filtroFecha) {
        query = query
          .gte("fecha", `${filtroFecha}T00:00:00`)
          .lte("fecha", `${filtroFecha}T23:59:59`);
      }

      if (filtroSeccion) {
        query = query.eq("seccion", filtroSeccion);
      }

      if (filtroModificador) {
        query = query.ilike(
          "usuario_modificador_id.nombre",
          `%${filtroModificador}%`
        );
      }

      if (filtroModificado) {
        query = query.ilike("usuario_modificado", `%${filtroModificado}%`);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;

      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, total: count };
    },
    refetchInterval: 5000,
  });
}
