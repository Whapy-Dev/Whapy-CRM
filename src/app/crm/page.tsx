"use client";

import {
  useAllMeetingsFromToday,
  useAllMeetingsUltimateWeek,
} from "@/hooks/admin/useAllMeetings";
import { useBudgetsActive, usePresupuestos } from "@/hooks/admin/useBudgets";
import { useLeadsRecent, useLeadsUltimateMonth } from "@/hooks/admin/useLeads";
import { useLeadConversionMetrics } from "@/hooks/admin/useLeadConversion";
import { useRoles, useUserRolProfiles } from "@/hooks/admin/useRoles";
import { useAuth } from "@/hooks/useAuth";
import { Users, UserCheck, Calendar, TrendingUp, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const allowedRoles = ["CEO", "COO", "QA"];

export default function CRMDashboard() {
  const { roleAdmin } = useAuth();
  const router = useRouter();
  const {
    data: roles,
    isLoading: loadingRoles,
    isError: errorRoles,
  } = useRoles();
  const {
    data: users,
    refetch: refetchUsers,
    isLoading: loadingUsers,
    isError: errorUsers,
  } = useUserRolProfiles();
  const { data: leadsRecent = [] } = useLeadsRecent();
  const { data: AllMeetingsUltimateWeek = [] } = useAllMeetingsUltimateWeek();
  const { data: budgetsActive = [] } = useBudgetsActive();
  const { data: AllMeetingFromToday = [] } = useAllMeetingsFromToday();
  const { data: budgets = [] } = usePresupuestos();
  const { data: conversionMetrics, isLoading: loadingMetrics } =
    useLeadConversionMetrics();

  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (roleAdmin) {
      if (roleAdmin === "Diseñador" || roleAdmin === "Desarrollador") {
        router.replace("/crm/proyectos");
        return;
      }
      if (roleAdmin === "Sales manager") {
        router.replace("/crm/usuarios");
        return;
      }

      if (!allowedRoles.includes(roleAdmin)) {
        setHasAccess(false);
        router.replace("/crm");
      } else {
        setHasAccess(true);
      }
    }
  }, [roleAdmin, router]);

  if (hasAccess === null || loadingRoles || loadingUsers || loadingMetrics) {
    return <p className="p-6 text-blue-600">Validando datos...</p>;
  }
  if (errorRoles || errorUsers) {
    return <p className="p-6 text-red-600">Error al cargar datos</p>;
  }

  if (!hasAccess) {
    return null;
  }

  const en_revision = budgets.filter((b) => b.estado === "En revisión");
  const presentado = budgets.filter((b) => b.estado === "Presentado");
  const aceptado = budgets.filter((b) => b.estado === "Aceptado");
  const rechazado = budgets.filter((b) => b.estado === "Rechazado");

  const budgetsPipeline = [
    {
      estado: "En revisión",
      count: en_revision.length,
      amount: en_revision.reduce((sum: number, b) => sum + (b.monto || 0), 0),
    },
    {
      estado: "Presentado",
      count: presentado.length,
      amount: presentado.reduce((sum: number, b) => sum + (b.monto || 0), 0),
    },
    {
      estado: "Rechazado",
      count: rechazado.length,
      amount: rechazado.reduce((sum: number, b) => sum + (b.monto || 0), 0),
    },
    {
      estado: "Aceptado",
      count: aceptado.length,
      amount: aceptado.reduce((sum: number, b) => sum + (b.monto || 0), 0),
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Conversión de Lead a Cliente
        </p>
      </div>

      {/* Stats Grid - Métricas de Conversión */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Leads del Mes */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Leads del Mes
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {conversionMetrics?.leadsThisMonth ?? 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Leads activos este mes
          </p>
        </div>

        {/* Leads Convertidos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Leads → Clientes
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {conversionMetrics?.conversionsThisMonth ?? 0}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Conversiones este mes
          </p>
        </div>

        {/* Tasa de Conversión */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Tasa de Conversión
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {conversionMetrics?.conversionRate ?? 0}%
            <span className="text-lg font-normal text-gray-500 ml-2">
              ({conversionMetrics?.conversionsThisMonth ?? 0})
            </span>
          </p>
          <p className="text-sm text-gray-500 mt-2">Este mes</p>
        </div>
      </div>
      {/* Pipeline de Presupuestos */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Pipeline de Presupuestos
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {budgetsPipeline.map((stage, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  {stage.estado}
                </h3>
                <div className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {stage.count}
                    </span>
                    <span className="text-sm text-gray-500">presupuestos</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {formatCurrency(stage.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Leads Recientes</h2>
            <a
              href="/crm/leads"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ver todos →
            </a>
          </div>
          <div className="divide-y divide-gray-200">
            {leadsRecent.map((lead) => (
              <div
                key={lead.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {lead.nombre}
                    </h3>
                    <p className="text-sm text-gray-600">{lead.empresa}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-full">
                      {lead.telefono}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(lead.created_at).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Próximas Reuniones */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Próximas Reuniones
            </h2>
            <a
              href="/crm/meetings"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Ver calendario →
            </a>
          </div>
          <div className="divide-y divide-gray-200">
            {AllMeetingFromToday.map((meeting) => {
              const date = new Date(meeting.start_at);
              return (
                <div
                  key={meeting.meeting_id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {meeting.leads?.name || meeting.profiles?.nombre}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          Reunión de {meeting.summary_md}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {date.toLocaleDateString("es-AR", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}{" "}
                          •{" "}
                          {date.toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
