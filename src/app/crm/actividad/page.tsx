"use client";

import { useState } from "react";
import { useActividadLogs } from "@/hooks/admin/useActividad";
import ActividadTable from "./components/ActividadTable";
import { useDebounce } from "@/hooks/admin/useDebounce";
const secciones = [
  "",
  "Usuarios",
  "Proyectos",
  "Documentos",
  "Reuniones",
  "Leads",
];
export default function ActividadPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroSeccion, setFiltroSeccion] = useState("");
  const [filtroModificador, setFiltroModificador] = useState("");
  const [filtroModificado, setFiltroModificado] = useState("");

  const debouncedFecha = useDebounce(filtroFecha);
  const debouncedSeccion = useDebounce(filtroSeccion);
  const debouncedModificador = useDebounce(filtroModificador);
  const debouncedModificado = useDebounce(filtroModificado);

  const { data, isLoading, error } = useActividadLogs({
    page,
    limit,
    filtroFecha: debouncedFecha,
    filtroSeccion: debouncedSeccion,
    filtroModificador: debouncedModificador,
    filtroModificado: debouncedModificado,
  });

  const logs = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  if (isLoading)
    return <p className="p-4 text-gray-500">Cargando historial...</p>;
  if (error)
    return <p className="p-4 text-red-500">Error al cargar el historial.</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Historial de Actividad</h1>

      {/* FILTROS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Modificador */}
        <div>
          <label className="text-sm font-medium">Usuario modificador</label>
          <input
            type="text"
            value={filtroModificador}
            onChange={(e) => {
              setPage(1);
              setFiltroModificador(e.target.value);
            }}
            placeholder="Nombre"
            className="w-full mt-1 border rounded-md p-2"
          />
        </div>

        {/* Modificado */}
        <div>
          <label className="text-sm font-medium">Usuario modificado</label>
          <input
            type="text"
            value={filtroModificado}
            onChange={(e) => {
              setPage(1);
              setFiltroModificado(e.target.value);
            }}
            placeholder="Nombre"
            className="w-full mt-1 border rounded-md p-2"
          />
        </div>

        {/* Secciones */}
        <div>
          <label className="text-sm font-medium">Sección</label>
          <select
            value={filtroSeccion}
            onChange={(e) => {
              setPage(1);
              setFiltroSeccion(e.target.value);
            }}
            className="w-full mt-1 border rounded-md p-2"
          >
            {secciones.map((sec, i) => (
              <option key={i} value={sec}>
                {sec || "Todas las secciones"}
              </option>
            ))}
          </select>
        </div>

        {/* Fecha */}
        <div>
          <label className="text-sm font-medium">Fecha</label>
          <input
            type="date"
            value={filtroFecha}
            onChange={(e) => {
              setPage(1);
              setFiltroFecha(e.target.value);
            }}
            className="w-full mt-1 border rounded-md p-2"
          />
        </div>
      </div>

      {/* TABLA */}
      <ActividadTable logs={logs} />

      {/* PAGINACIÓN */}
      <div className="flex justify-between items-center pt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Anterior
        </button>

        <span>
          Página {page} de {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
