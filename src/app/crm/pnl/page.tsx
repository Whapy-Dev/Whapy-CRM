"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useEgresos } from "@/hooks/admin/useEgresos";
import { useIngresos } from "@/hooks/admin/useIngresos";
import { useState } from "react";
import { TableEgresos } from "./components/TableEgresos";
import { TableIngresos } from "./components/TableIngresos";

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
function getLocalDayBounds(dateString: string) {
  const date = new Date(dateString + "T00:00:00");

  const from = new Date(date);
  from.setHours(0, 0, 0, 0);

  const to = new Date(date);
  to.setHours(23, 59, 59, 999);

  return { from, to };
}
export default function FinanzasPage() {
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
  const [searchIngresos, setSearchIngresos] = useState<string>("");
  const [dateFromIngresos, setDateFromIngresos] = useState<string>("");
  const [dateToIngresos, setDateToIngresos] = useState<string>("");

  const [searchEgresos, setSearchEgresos] = useState<string>("");
  const [dateFromEgresos, setDateFromEgresos] = useState<string>("");
  const [dateToEgresos, setDateToEgresos] = useState<string>("");

  // ======== TOTALES ========
  const totalIngresos = ingresosTyped.reduce(
    (acc, row) => acc + (Number(row.Ingreso) || 0),
    0
  );

  const totalEgresos = egresosTyped.reduce(
    (acc, row) => acc + (Number(row.Egreso) || 0),
    0
  );

  const balanceFinal = totalIngresos - totalEgresos;

  // ======== FILTRADO REAL ========
  const ingresosFiltrados = ingresosTyped.filter((row) => {
    const texto = (row.Descripcion || row.descripcion || "").toLowerCase();
    const coincideTexto = texto.includes(searchIngresos.toLowerCase());

    const fecha = new Date(row.created_at);

    let coincideFecha = true;

    if (dateFromIngresos) {
      const { from } = getLocalDayBounds(dateFromIngresos);
      coincideFecha = coincideFecha && fecha >= from;
    }

    if (dateToIngresos) {
      const { to } = getLocalDayBounds(dateToIngresos);
      coincideFecha = coincideFecha && fecha <= to;
    }

    return coincideTexto && coincideFecha;
  });

  const egresosFiltrados = egresosTyped.filter((row) => {
    const texto = (row.Descripcion || row.descripcion || "").toLowerCase();
    const coincideTexto = texto.includes(searchEgresos.toLowerCase());

    const fecha = new Date(row.created_at);

    let coincideFecha = true;

    if (dateFromEgresos) {
      const { from } = getLocalDayBounds(dateFromEgresos);
      coincideFecha = coincideFecha && fecha >= from;
    }

    if (dateToEgresos) {
      const { to } = getLocalDayBounds(dateToEgresos);
      coincideFecha = coincideFecha && fecha <= to;
    }

    return coincideTexto && coincideFecha;
  });

  return (
    <main className="min-h-screen bg-gray-100 p-8 space-y-8">
      {/* ======== RESUMEN FINANCIERO ======== */}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Desde</label>
              <input
                type="date"
                className="border rounded-xl p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                value={dateFromEgresos}
                onChange={(e) => setDateFromEgresos(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Hasta</label>
              <input
                type="date"
                className="border rounded-xl p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                value={dateToEgresos}
                onChange={(e) => setDateToEgresos(e.target.value)}
              />
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Desde</label>
              <input
                type="date"
                className="border rounded-xl p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                value={dateFromIngresos}
                onChange={(e) => setDateFromIngresos(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-600">Hasta</label>
              <input
                type="date"
                className="border rounded-xl p-2 text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none"
                value={dateToIngresos}
                onChange={(e) => setDateToIngresos(e.target.value)}
              />
            </div>
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
