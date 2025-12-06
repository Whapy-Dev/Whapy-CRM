// hooks/admin/useLeadConversion.ts
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useLeadConversionMetrics() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["lead-conversion-metrics"],
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        0,
        23,
        59,
        59
      );

      // Leads creados este mes (type = Lead)
      const { data: leadsThisMonth, error: errorLeads } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "cliente")
        .eq("type", "Lead")
        .gte("created_at", startOfMonth.toISOString())
        .lte("created_at", endOfMonth.toISOString());

      if (errorLeads) throw errorLeads;

      // Conversiones este mes (usando converted_at)
      const { data: conversions, error: errorConversions } = await supabase
        .from("profiles")
        .select("id")
        .eq("role", "cliente")
        .eq("type", "Cliente")
        .not("converted_at", "is", null)
        .gte("converted_at", startOfMonth.toISOString())
        .lte("converted_at", endOfMonth.toISOString());

      if (errorConversions) throw errorConversions;

      const leadsCount = leadsThisMonth?.length || 0;
      const conversionsCount = conversions?.length || 0;

      // Tasa: conversiones / (leads actuales + conversiones que ya no son leads)
      const totalLeadsBase = leadsCount + conversionsCount;
      const conversionRate =
        totalLeadsBase > 0
          ? Math.round((conversionsCount / totalLeadsBase) * 100)
          : 0;

      return {
        leadsThisMonth: leadsCount,
        conversionsThisMonth: conversionsCount,
        conversionRate,
      };
    },
  });
}
