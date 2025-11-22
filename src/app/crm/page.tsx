"use client";

import {
  useAllMeetingsFromToday,
  useAllMeetingsUltimateWeek,
} from "@/hooks/admin/useAllMeetings";
import { useBudgets, useBudgetsActive } from "@/hooks/admin/useBudgets";
import { useLeadsRecent, useLeadsUltimateMonth } from "@/hooks/admin/useLeads";
import {
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export default function CRMDashboard() {
  const { data: leadsUltimateMonth = [] } = useLeadsUltimateMonth();
  const { data: leadsRecent = [] } = useLeadsRecent();
  const { data: AllMeetingsUltimateWeek = [] } = useAllMeetingsUltimateWeek();
  const { data: budgetsActive = [] } = useBudgetsActive();
  const { data: AllMeetingFromToday = [] } = useAllMeetingsFromToday();
  const { data: budgets = [] } = useBudgets();
  const en_revision = budgets.filter((b) => b.status === "en revision");
  const presentado = budgets.filter((b) => b.status === "presentado");
  const aceptado = budgets.filter((b) => b.status === "aceptado");
  const rechazado = budgets.filter((b) => b.status === "rechazado");

  const budgetsPipeline = [
    {
      status: "en revision",
      count: en_revision.length,
      amount: en_revision.reduce(
        (sum: number, b) => sum + (b.amount_total || 0),
        0
      ),
    },
    {
      status: "Presentado",
      count: presentado.length,
      amount: presentado.reduce(
        (sum: number, b) => sum + (b.amount_total || 0),
        0
      ),
    },
    {
      status: "Rechazado",
      count: rechazado.length,
      amount: rechazado.reduce(
        (sum: number, b) => sum + (b.amount_total || 0),
        0
      ),
    },
    {
      status: "Aceptado",
      count: aceptado.length,
      amount: aceptado.reduce(
        (sum: number, b) => sum + (b.amount_total || 0),
        0
      ),
    },
  ];

  const stats = {
    totalLeads: leadsUltimateMonth.length,
    leadsChange: 12,
    activeBudgets: budgetsActive.length,
    budgetsChange: -3,
    upcomingMeetings: AllMeetingsUltimateWeek.length,
    meetingsChange: 2,
    conversionRate: 34,
    rateChange: 5,
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Vista general de tu actividad comercial
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Leads */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                stats.leadsChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.leadsChange >= 0 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {Math.abs(stats.leadsChange)}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Total Leads
          </h3>
          <p className="text-3xl font-bold text-gray-900">{stats.totalLeads}</p>
          <p className="text-sm text-gray-500 mt-2">Este mes</p>
        </div>

        {/* Active Budgets */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                stats.budgetsChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.budgetsChange >= 0 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {Math.abs(stats.budgetsChange)}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Presupuestos Activos
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.activeBudgets}
          </p>
          <p className="text-sm text-gray-500 mt-2">En proceso</p>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                stats.meetingsChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.meetingsChange >= 0 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {Math.abs(stats.meetingsChange)}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Reuniones Próximas
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.upcomingMeetings}
          </p>
          <p className="text-sm text-gray-500 mt-2">Esta semana</p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-yellow-600" />
            </div>
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                stats.rateChange >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {stats.rateChange >= 0 ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {Math.abs(stats.rateChange)}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Tasa de Conversión
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {stats.conversionRate}%
          </p>
          <p className="text-sm text-gray-500 mt-2">Último trimestre</p>
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
                  {stage.status}
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
