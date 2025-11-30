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
  project_id: string;
  created_at: string;
  Descripcion?: string;
  descripcion?: string;
  Ingreso?: number;
  projects?: ProjectRelation;
}

/** Fila de egreso */
interface Egreso {
  id: string;
  project_id: string;
  created_at: string;
  Descripcion?: string;
  descripcion?: string;
  Egreso?: number;
  profiles?: ProfileRelation;
}
function getDateRange(filtro: "hoy" | "semana" | "mes") {
  const now = new Date();
  const start = new Date(now);
  const end = new Date(now);

  if (filtro === "hoy") {
    start.setHours(0, 0, 0, 0);
  }

  if (filtro === "semana") {
    // Retrocede 6 días para incluir los últimos 7 días
    start.setDate(now.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  }

  if (filtro === "mes") {
    // Retrocede 29 días para incluir los últimos 30 días
    start.setDate(now.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }

  end.setHours(23, 59, 59, 999);

  return { start, end };
}

const allowedRoles = ["CEO", "COO"];
export default function FinanzasPage() {
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

  /** ↑ IMPORTANT: forzado a `Ingreso[]` y `Egreso[]` */
  const ingresosTyped = ingresos as Ingreso[];
  const egresosTyped = egresos as Egreso[];

  // ======== FILTROS ========
  // Inputs tipados directamente acá, sin reutilizar componentes
  const [filtroFecha, setFiltroFecha] = useState<"hoy" | "semana" | "mes">(
    "mes"
  );

  const [searchIngresos, setSearchIngresos] = useState<string>("");

  const [searchEgresos, setSearchEgresos] = useState<string>("");

  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // null = todavía no sabemos

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
  const { start, end } = getDateRange(filtroFecha);
  // ======== TOTALES ========
  const totalIngresos = ingresosTyped
    .filter((row) => {
      const fecha = new Date(row.created_at);
      return fecha >= start && fecha <= end;
    })
    .reduce((acc, row) => acc + (Number(row.Ingreso) || 0), 0);

  const totalEgresos = egresosTyped
    .filter((row) => {
      const fecha = new Date(row.created_at);
      return fecha >= start && fecha <= end;
    })
    .reduce((acc, row) => acc + (Number(row.Egreso) || 0), 0);

  const balanceFinal = totalIngresos - totalEgresos;

  // ======== FILTRADO REAL ========
  const ingresosFiltrados = ingresosTyped.filter((row) => {
    const texto = (row.Descripcion || row.descripcion || "").toLowerCase();
    const coincideTexto = texto.includes(searchIngresos.toLowerCase());

    const fecha = new Date(row.created_at);
    const coincideFiltroGlobal = fecha >= start && fecha <= end;

    return coincideTexto && coincideFiltroGlobal;
  });

  const egresosFiltrados = egresosTyped.filter((row) => {
    const texto = (row.Descripcion || row.descripcion || "").toLowerCase();
    const coincideTexto = texto.includes(searchEgresos.toLowerCase());

    const fecha = new Date(row.created_at);
    const coincideFiltroGlobal = fecha >= start && fecha <= end;

    return coincideTexto && coincideFiltroGlobal;
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8 space-y-8">
      {/* ======== RESUMEN FINANCIERO ======== */}
      <section className="flex gap-4 justify-center">
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
            filtroFecha === "semana" ? "bg-blue-600 text-white" : "bg-gray-50"
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
      </section>

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

      {/* ======== FILTROS (tipados y profesionales, sin reutilizar componentes) ======== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Egresos */}
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
        </div>

        {/* Ingresos */}
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
        </div>
      </section>

      {/* ======== TABLAS ======== */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </section>
    </main>
  );
}
