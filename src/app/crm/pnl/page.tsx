"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEgresos } from "@/hooks/admin/useEgresos";
import { useIngresos } from "@/hooks/admin/useIngresos";
import { useEffect, useState } from "react";
import { TableEgresos } from "./components/TableEgresos";
import { TableIngresos } from "./components/TableIngresos";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, useUserRolProfiles } from "@/hooks/admin/useRoles";
import { PieChartIngresos } from "./components/PieChartIngresos";
import { PieChartEgresos } from "./components/PieChartEgresos";

/** Relación con tabla Projects */
interface ProjectRelation {
  title: string;
}

/** Relación con tabla Profiles en egresos */
interface ProfileRelation {
  nombre: string;
}

/** Fila de ingreso */
interface Ingreso {
  id: string;
  project_id?: string;
  created_at: string;
  Descripcion?: string;
  Ingreso?: number;
  projects?: ProjectRelation;
  categoria: string;
  subcategoria: string;
  presupuesto_id: string;
  nombre: string;
  recurrente: string;
  divisa: string;
  es_recurrente: boolean;
  fecha_recurrente: string;
  intervalo: string;
}

/** Fila de egreso */
interface Egreso {
  id: string;
  project_id: string;
  created_at: string;
  Descripcion?: string;
  Egreso?: number;
  profiles?: ProfileRelation;
  categoria: string;
  recurrente: string;
  subcategoria: string;
  divisa: string;
  es_recurrente: boolean;
  fecha_recurrente: string;
  intervalo: string;
}

function getDateRange(filtro: "hoy" | "semana" | "mes" | "custom") {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (filtro === "hoy") {
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
  }

  if (filtro === "semana") {
    // Obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
    const dayOfWeek = now.getDay();
    // Calcular el lunes de esta semana (si es domingo, retroceder 6 días)
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    start.setDate(now.getDate() - diffToMonday);
    start.setHours(0, 0, 0, 0);

    // El domingo es 6 días después del lunes
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  }

  if (filtro === "mes") {
    // Primer día del mes actual
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    // Último día del mes actual
    end.setMonth(now.getMonth() + 1, 0); // Día 0 del próximo mes = último día del mes actual
    end.setHours(23, 59, 59, 999);
  }

  return { start, end };
}

// Helper para filtrar por rango de fechas personalizado
function filterByDateRange(fecha: Date, desde: string, hasta: string): boolean {
  if (!desde && !hasta) return true;
  const desdeDate = desde ? new Date(desde) : null;
  const hastaDate = hasta ? new Date(hasta + "T23:59:59") : null;
  return (
    (!desdeDate || fecha >= desdeDate) && (!hastaDate || fecha <= hastaDate)
  );
}

const allowedRoles = ["CEO", "COO", "QA"];

export default function FinanzasPage() {
  const { roleAdmin } = useAuth();
  const router = useRouter();
  const { isLoading: loadingRoles, isError: errorRoles } = useRoles();
  const { isLoading: loadingUsers, isError: errorUsers } = useUserRolProfiles();
  const {
    data: ingresos = [],
    isLoading: loadingIngresos,
    refetch: refetchIngresos,
  } = useIngresos();
  const {
    data: egresos = [],
    isLoading: loadingEgresos,
    refetch: refetchEgresos,
  } = useEgresos();

  const ingresosTyped = ingresos as Ingreso[];
  const egresosTyped = egresos as Egreso[];

  // ======== FILTROS GLOBALES (PNL) ========
  const [filtroFecha, setFiltroFecha] = useState<
    "hoy" | "semana" | "mes" | "custom" | "siempre"
  >("mes");
  const [fechaGlobalDesde, setFechaGlobalDesde] = useState("");
  const [fechaGlobalHasta, setFechaGlobalHasta] = useState("");

  // ======== FILTROS INDIVIDUALES ========
  const [vista, setVista] = useState<"ingresos" | "egresos" | "todos">("todos");
  const [searchIngresos, setSearchIngresos] = useState("");
  const [searchEgresos, setSearchEgresos] = useState("");

  // Filtros de fecha individuales
  const [fechaIngresosDesde, setFechaIngresosDesde] = useState("");
  const [fechaIngresosHasta, setFechaIngresosHasta] = useState("");
  const [fechaEgresosDesde, setFechaEgresosDesde] = useState("");
  const [fechaEgresosHasta, setFechaEgresosHasta] = useState("");

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

  if (hasAccess === null || loadingRoles || loadingUsers) {
    return <p className="p-6 text-blue-600">Validando datos...</p>;
  }
  if (errorRoles || errorUsers) {
    return <p className="p-6 text-red-600">Error al cargar datos</p>;
  }

  if (!hasAccess) {
    return null;
  }

  // ======== LÓGICA DE FILTRADO GLOBAL (PNL) ========
  // Modificar la función filterForPNL
  const filterForPNL = (fecha: Date): boolean => {
    if (filtroFecha === "siempre") return true;
    if (filtroFecha === "custom") {
      return filterByDateRange(fecha, fechaGlobalDesde, fechaGlobalHasta);
    }
    const { start, end } = getDateRange(filtroFecha);
    return fecha >= start && fecha <= end;
  };

  // ======== TOTALES (PNL) - igual ========
  const totalIngresos = ingresosTyped
    .filter((row) => filterForPNL(new Date(row.created_at)))
    .reduce((acc, row) => acc + (Number(row.Ingreso) || 0), 0);

  const totalEgresos = egresosTyped
    .filter((row) => filterForPNL(new Date(row.created_at)))
    .reduce((acc, row) => acc + (Number(row.Egreso) || 0), 0);

  const balanceFinal = totalIngresos - totalEgresos;

  // ======== FILTRADO PARA TABLAS (ACTUALIZADO) ========
  const ingresosFiltrados = ingresosTyped.filter((row) => {
    const texto = (row.Descripcion || "").toLowerCase();
    const coincideTexto = texto.includes(searchIngresos.toLowerCase());
    const fecha = new Date(row.created_at);

    // Siempre aplicar filtro global
    const coincideFiltroGlobal = filterForPNL(fecha);

    // Si estamos en vista "ingresos", aplicar también filtros individuales de fecha
    if (vista === "ingresos") {
      const coincideFechaIndividual =
        !fechaIngresosDesde && !fechaIngresosHasta
          ? true
          : filterByDateRange(fecha, fechaIngresosDesde, fechaIngresosHasta);
      return coincideTexto && coincideFiltroGlobal && coincideFechaIndividual;
    }

    return coincideTexto && coincideFiltroGlobal;
  });

  const egresosFiltrados = egresosTyped.filter((row) => {
    const texto = (
      row.Descripcion ||
      row.categoria ||
      row.subcategoria ||
      ""
    ).toLowerCase();
    const coincideTexto = texto.includes(searchEgresos.toLowerCase());
    const fecha = new Date(row.created_at);

    // Siempre aplicar filtro global
    const coincideFiltroGlobal = filterForPNL(fecha);

    // Si estamos en vista "egresos", aplicar también filtros individuales de fecha
    if (vista === "egresos") {
      const coincideFechaIndividual =
        !fechaEgresosDesde && !fechaEgresosHasta
          ? true
          : filterByDateRange(fecha, fechaEgresosDesde, fechaEgresosHasta);
      return coincideTexto && coincideFiltroGlobal && coincideFechaIndividual;
    }

    return coincideTexto && coincideFiltroGlobal;
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8 space-y-8">
      {/* ======== FILTRO GLOBAL DE FECHA (PNL) ======== */}
      <section className="bg-white p-4 rounded-2xl shadow-md border">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Filtro Global (PNL)
        </h2>
        <div className="flex flex-wrap gap-4 justify-center items-end">
          <div className="flex gap-2">
            <button
              onClick={() => setFiltroFecha("siempre")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                filtroFecha === "siempre"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50"
              }`}
            >
              Desde siempre
            </button>
            <button
              onClick={() => setFiltroFecha("hoy")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                filtroFecha === "hoy" ? "bg-blue-600 text-white" : "bg-gray-50"
              }`}
            >
              Hoy
            </button>
            <button
              onClick={() => setFiltroFecha("semana")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                filtroFecha === "semana"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50"
              }`}
            >
              Semana
            </button>
            <button
              onClick={() => setFiltroFecha("mes")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                filtroFecha === "mes" ? "bg-blue-600 text-white" : "bg-gray-50"
              }`}
            >
              Mes
            </button>
            <button
              onClick={() => setFiltroFecha("custom")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                filtroFecha === "custom"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-50"
              }`}
            >
              Personalizado
            </button>
          </div>

          {filtroFecha === "custom" && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Desde</label>
                <input
                  type="date"
                  value={fechaGlobalDesde}
                  onChange={(e) => setFechaGlobalDesde(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <span className="text-gray-400 mt-5">-</span>
              <div className="flex flex-col">
                <label className="text-xs text-gray-500 mb-1">Hasta</label>
                <input
                  type="date"
                  value={fechaGlobalHasta}
                  onChange={(e) => setFechaGlobalHasta(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ======== RESUMEN FINANCIERO (PNL) ======== */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-md border bg-white">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-gray-500 uppercase">
              Total Egresos
            </p>
            <p className="text-4xl font-bold text-red-600 mt-1">
              {loadingEgresos
                ? "—"
                : `$ ${totalEgresos.toLocaleString("es-AR")}`}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border bg-gray-50">
          <CardContent className="p-6 text-center">
            <p className="text-sm font-medium text-gray-500 uppercase">
              Balance
            </p>
            <p
              className={`text-4xl font-bold mt-1 ${
                balanceFinal >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {loadingIngresos || loadingEgresos
                ? "—"
                : `$ ${balanceFinal.toLocaleString("es-AR")}`}
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-md border bg-white">
          <CardContent className="p-6 text-right">
            <p className="text-sm font-medium text-gray-500 uppercase">
              Total Ingresos
            </p>
            <p className="text-4xl font-bold text-green-600 mt-1">
              {loadingIngresos
                ? "—"
                : `$ ${totalIngresos.toLocaleString("es-AR")}`}
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ======== SELECTOR DE VISTA ======== */}
      <section className="flex gap-4 justify-center">
        <button
          onClick={() => setVista("egresos")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
            vista === "egresos" ? "bg-blue-600 text-white" : "bg-gray-50"
          }`}
        >
          Egresos
        </button>
        <button
          onClick={() => setVista("todos")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
            vista === "todos" ? "bg-blue-600 text-white" : "bg-gray-50"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setVista("ingresos")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
            vista === "ingresos" ? "bg-blue-600 text-white" : "bg-gray-50"
          }`}
        >
          Ingresos
        </button>
      </section>

      {/* ======== FILTROS INDIVIDUALES ======== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Filtro Egresos - Solo visible cuando vista es "egresos" o "todos" */}
        {(vista === "egresos" || vista === "todos") && (
          <div className="bg-white p-6 rounded-2xl shadow-md border space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Filtrar Egresos
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Buscar por descripción
              </label>
              <input
                className="border rounded-xl p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Ej: pago, servicio, etc..."
                value={searchEgresos}
                onChange={(e) => setSearchEgresos(e.target.value)}
              />
            </div>

            {/* Filtro de fecha individual - Solo en vista "egresos" */}
            {vista === "egresos" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Rango de fechas
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={fechaEgresosDesde}
                    onChange={(e) => setFechaEgresosDesde(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={fechaEgresosHasta}
                    onChange={(e) => setFechaEgresosHasta(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filtro Ingresos - Solo visible cuando vista es "ingresos" o "todos" */}
        {(vista === "ingresos" || vista === "todos") && (
          <div className="bg-white p-6 rounded-2xl shadow-md border space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Filtrar Ingresos
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">
                Buscar por descripción
              </label>
              <input
                className="border rounded-xl p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                placeholder="Ej: transferencia, contrato, etc..."
                value={searchIngresos}
                onChange={(e) => setSearchIngresos(e.target.value)}
              />
            </div>

            {/* Filtro de fecha individual - Solo en vista "ingresos" */}
            {vista === "ingresos" && (
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-600">
                  Rango de fechas
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={fechaIngresosDesde}
                    onChange={(e) => setFechaIngresosDesde(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="date"
                    value={fechaIngresosHasta}
                    onChange={(e) => setFechaIngresosHasta(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ======== TABLAS ======== */}
      <section className="space-y-6">
        {/* Solo Egresos: tabla + gráfico */}
        {vista === "egresos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableEgresos
              egresos={egresosFiltrados}
              isLoading={loadingEgresos}
              refetchEgresos={refetchEgresos}
            />
            <PieChartEgresos egresos={egresosFiltrados} />
          </div>
        )}

        {/* Solo Ingresos: tabla + gráfico */}
        {vista === "ingresos" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TableIngresos
              ingresos={ingresosFiltrados}
              isLoading={loadingIngresos}
              refetchIngresos={refetchIngresos}
            />
            <PieChartIngresos ingresos={ingresosFiltrados} />
          </div>
        )}

        {/* Todos: solo tablas lado a lado */}
        {vista === "todos" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TableEgresos
              egresos={egresosFiltrados}
              isLoading={loadingEgresos}
              refetchEgresos={refetchEgresos}
            />
            <TableIngresos
              ingresos={ingresosFiltrados}
              isLoading={loadingIngresos}
              refetchIngresos={refetchIngresos}
            />
          </div>
        )}
      </section>
    </main>
  );
}
