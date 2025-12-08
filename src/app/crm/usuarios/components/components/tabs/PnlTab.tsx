// PnlTab.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/utils/types";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  User,
  ExternalLink,
  Search,
  X,
} from "lucide-react";

type Ingreso = {
  id: string;
  Ingreso: number;
  Descripcion: string;
  categoria: string;
  subcategoria: string;
  created_at: string;
  factura_url?: string;
  profiles?: {
    nombre: string;
  };
};

type Egreso = {
  id: string;
  Egreso: number;
  Descripcion: string;
  categoria: string;
  subcategoria: string;
  created_at: string;
  factura_url?: string;
  profiles?: {
    nombre: string;
  };
};

type Props = {
  selectedProject: Project;
  loading: boolean;
  setLoading: (loading: boolean) => void;
};

export default function PnlTab({
  selectedProject,
  loading,
  setLoading,
}: Props) {
  const [ingresos, setIngresos] = useState<Ingreso[]>([]);
  const [egresos, setEgresos] = useState<Egreso[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filtro de búsqueda por usuario
  const [busquedaUsuario, setBusquedaUsuario] = useState("");

  // Filtros de fecha
  const [fechaDesde, setFechaDesde] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split("T")[0];
  });
  const [fechaHasta, setFechaHasta] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  // Cargar datos
  useEffect(() => {
    async function fetchData() {
      if (!selectedProject?.id) return;

      setLoadingData(true);
      const supabase = createClient();

      try {
        const fechaDesdeISO = new Date(fechaDesde + "T00:00:00").toISOString();
        const fechaHastaISO = new Date(fechaHasta + "T23:59:59").toISOString();

        const { data: ingresosData, error: ingresosError } = await supabase
          .from("Ingresos")
          .select(
            `
            id,
            Ingreso,
            Descripcion,
            categoria,
            subcategoria,
            divisa,
            created_at,
            factura_url
          `
          )
          .eq("presupuesto_id", selectedProject?.presupuesto?.id)
          .gte("created_at", fechaDesdeISO)
          .lte("created_at", fechaHastaISO)
          .order("created_at", { ascending: false });

        if (ingresosError) throw ingresosError;

        const { data: egresosData, error: egresosError } = await supabase
          .from("Egresos")
          .select(
            `
            id,
            Egreso,
            Descripcion,
            categoria,
            subcategoria,
            created_at,
            factura_url,
            profiles(nombre)
          `
          )
          .eq("project_id", selectedProject.id)
          .gte("created_at", fechaDesdeISO)
          .lte("created_at", fechaHastaISO)
          .order("created_at", { ascending: false });

        if (egresosError) throw egresosError;

        setIngresos((ingresosData as unknown as Ingreso[]) || []);
        setEgresos((egresosData as unknown as Egreso[]) || []);
      } catch (error) {
        console.error("Error al cargar PNL:", error);
      } finally {
        setLoadingData(false);
      }
    }

    fetchData();
  }, [
    selectedProject?.id,
    selectedProject?.presupuesto,
    fechaDesde,
    fechaHasta,
  ]);

  // Filtrar egresos por búsqueda de usuario
  const egresosFiltrados = busquedaUsuario.trim()
    ? egresos.filter((egreso) =>
        egreso.profiles?.nombre
          ?.toLowerCase()
          .includes(busquedaUsuario.toLowerCase())
      )
    : egresos;

  // Calcular totales
  const totalIngresos = ingresos.reduce((sum, i) => sum + (i.Ingreso || 0), 0);
  const totalEgresos = egresosFiltrados.reduce(
    (sum, e) => sum + (e.Egreso || 0),
    0
  );
  const balance = totalIngresos - totalEgresos;
  const margen = totalIngresos > 0 ? (balance / totalIngresos) * 100 : 0;

  // Obtener usuarios únicos para sugerencias
  const usuariosUnicos = [
    ...new Set(
      egresos
        .map((e) => e.profiles?.nombre)
        .filter((nombre): nombre is string => Boolean(nombre))
    ),
  ];

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };
  const presupuesto = selectedProject?.presupuesto;
  const cashCollected = presupuesto?.cash_collected || 0;
  const pendientePorCobrar = (presupuesto?.monto || 0) - cashCollected;

  return (
    <div className="space-y-6">
      {/* Filtros de fecha */}
      <div className="flex flex-wrap items-end gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-gray-500" />
          <span className="font-medium text-gray-700">Filtrar por fecha:</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>

        {/* Presets rápidos */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              const now = new Date();
              setFechaDesde(
                new Date(now.getFullYear(), now.getMonth(), 1)
                  .toISOString()
                  .split("T")[0]
              );
              setFechaHasta(now.toISOString().split("T")[0]);
            }}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            Este mes
          </button>
          <button
            onClick={() => {
              const now = new Date();
              setFechaDesde(
                new Date(now.getFullYear(), 0, 1).toISOString().split("T")[0]
              );
              setFechaHasta(now.toISOString().split("T")[0]);
            }}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            Este año
          </button>
          <button
            onClick={() => {
              setFechaDesde("2020-01-01");
              setFechaHasta(new Date().toISOString().split("T")[0]);
            }}
            className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            Todo
          </button>
        </div>
      </div>

      {/* Cards de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Total Ingresos */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-green-500 rounded-lg">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-sm font-medium text-green-700">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-green-800">
            {formatCurrency(totalIngresos)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {ingresos.length} transacción{ingresos.length !== 1 ? "es" : ""}
          </p>
        </div>

        {/* Total Egresos */}
        <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-red-500 rounded-lg">
              <TrendingDown size={18} className="text-white" />
            </div>
            <span className="text-sm font-medium text-red-700">Egresos</span>
          </div>
          <p className="text-2xl font-bold text-red-800">
            {formatCurrency(totalEgresos)}
          </p>
          <p className="text-xs text-red-600 mt-1">
            {egresosFiltrados.length} transacción
            {egresosFiltrados.length !== 1 ? "es" : ""}
            {busquedaUsuario && ` (filtrado)`}
          </p>
        </div>

        {/* Balance */}
        <div
          className={`bg-gradient-to-br ${
            balance >= 0
              ? "from-blue-50 to-blue-100 border-blue-200"
              : "from-orange-50 to-orange-100 border-orange-200"
          } border rounded-xl p-4`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`p-2 ${
                balance >= 0 ? "bg-blue-500" : "bg-orange-500"
              } rounded-lg`}
            >
              <DollarSign size={18} className="text-white" />
            </div>
            <span
              className={`text-sm font-medium ${
                balance >= 0 ? "text-blue-700" : "text-orange-700"
              }`}
            >
              Balance
            </span>
          </div>
          <p
            className={`text-2xl font-bold ${
              balance >= 0 ? "text-blue-800" : "text-orange-800"
            }`}
          >
            {formatCurrency(balance)}
          </p>
          <p
            className={`text-xs mt-1 ${
              balance >= 0 ? "text-blue-600" : "text-orange-600"
            }`}
          >
            {balance >= 0 ? "Ganancia" : "Pérdida"}
          </p>
        </div>

        {/* Margen */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <TrendingUp size={18} className="text-white" />
            </div>
            <span className="text-sm font-medium text-purple-700">Margen</span>
          </div>
          <p className="text-2xl font-bold text-purple-800">
            {margen.toFixed(1)}%
          </p>
          <p className="text-xs text-purple-600 mt-1">
            Rentabilidad del proyecto
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-amber-500 rounded-lg">
              <DollarSign size={18} className="text-white" />
            </div>
            <span className="text-sm font-medium text-amber-700">
              Cash Collected
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-800">
            {formatCurrency(pendientePorCobrar)}
          </p>
        </div>
      </div>

      {/* Presupuesto del proyecto */}
      <div className="p-4 bg-gray-100 rounded-xl">
        <p className="text-sm text-gray-600">
          Presupuesto del proyecto:{" "}
          <span className="font-bold text-gray-800">
            {formatCurrency(selectedProject?.presupuesto?.monto || 0)}
          </span>
        </p>
      </div>

      {loadingData ? (
        <div className="text-center py-8 text-gray-500">Cargando datos...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabla de Ingresos */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-green-50 px-4 py-3 border-b border-green-200 h-14">
              <h4 className="font-semibold text-green-800 flex items-center gap-2 h-9">
                <TrendingUp size={18} />
                Ingresos ({ingresos.length})
              </h4>
            </div>

            {ingresos.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No hay ingresos en este período
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {ingresos.map((ingreso) => (
                  <div
                    key={ingreso.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {formatCurrency(ingreso.Ingreso)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {ingreso.Descripcion || "Sin descripción"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            {ingreso.categoria}
                          </span>
                          {ingreso.subcategoria && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {ingreso.subcategoria}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(ingreso.created_at)}
                        </span>
                        {ingreso.factura_url && (
                          <a
                            href={ingreso.factura_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                          >
                            <FileText size={12} />
                            Factura
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabla de Egresos */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-red-50 px-4 py-3 border-b border-red-200">
              <div className="flex items-center justify-between gap-4">
                <h4 className="font-semibold text-red-800 flex items-center gap-2">
                  <TrendingDown size={18} />
                  Egresos ({egresosFiltrados.length})
                </h4>

                {/* Filtro por usuario */}
                <div className="relative flex-1 max-w-xs">
                  <Search
                    size={14}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Buscar por usuario..."
                    value={busquedaUsuario}
                    onChange={(e) => setBusquedaUsuario(e.target.value)}
                    className="w-full pl-8 pr-8 py-1.5 text-sm border border-red-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-300"
                    list="usuarios-egresos"
                  />
                  {busquedaUsuario && (
                    <button
                      onClick={() => setBusquedaUsuario("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <datalist id="usuarios-egresos">
                    {usuariosUnicos.map((nombre) => (
                      <option key={nombre} value={nombre} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {egresosFiltrados.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {busquedaUsuario
                  ? `No hay egresos de "${busquedaUsuario}"`
                  : "No hay egresos en este período"}
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                {egresosFiltrados.map((egreso) => (
                  <div
                    key={egreso.id}
                    className="p-4 border-b border-gray-100 hover:bg-gray-50 transition"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {formatCurrency(egreso.Egreso)}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {egreso.Descripcion || "Sin descripción"}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                            {egreso.categoria}
                          </span>
                          {egreso.subcategoria && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                              {egreso.subcategoria}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end gap-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(egreso.created_at)}
                        </span>
                        {egreso.profiles?.nombre && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <User size={12} />
                            {egreso.profiles?.nombre}
                          </span>
                        )}
                        {egreso.factura_url && (
                          <a
                            href={egreso.factura_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-xs"
                          >
                            <FileText size={12} />
                            Factura
                            <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
