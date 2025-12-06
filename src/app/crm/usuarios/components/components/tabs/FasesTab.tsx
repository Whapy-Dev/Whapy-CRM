// tabs/FasesTab.tsx
"use client";

import { useState } from "react";
import { Plus, Info, AlertTriangle } from "lucide-react";
import { Fase, formatCurrency } from "../types";
import { useFases } from "@/hooks/admin/usePresupuestos";
import FaseCard from "../components/FaseCard";
import { Project } from "@/utils/types";

interface FasesTabProps {
  selectedProject: Project;
  fases: Fase[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refetchFases: () => Promise<void>;
}

export default function FasesTab({
  selectedProject,
  fases,
  loading,
  setLoading,
  refetchFases,
}: FasesTabProps) {
  const presupuesto = selectedProject.presupuesto;
  const { crearFase, actualizarFase, eliminarFase } = useFases();

  const [showCrear, setShowCrear] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoMonto, setNuevoMonto] = useState<number>(0);
  const [nuevaFechaVencimiento, setNuevaFechaVencimiento] = useState(
    new Date().toISOString().split("T")[0]
  );

  if (!presupuesto) return null;

  const divisa = presupuesto.divisa;
  const montoTotal = presupuesto.monto;
  const montoAsignado = fases.reduce((sum, f) => sum + f.monto, 0);
  const montoDisponible = montoTotal - montoAsignado;
  const porcentajeAsignado = (montoAsignado / montoTotal) * 100;

  // Cálculos de cuotas
  const totalCuotas = fases.reduce(
    (sum, f) => sum + (f.cuotas?.length || 0),
    0
  );
  const cuotasPagadas = fases.reduce(
    (sum, f) =>
      sum + (f.cuotas?.filter((c) => c.estado === "Pagada").length || 0),
    0
  );
  const montoPagado = fases.reduce(
    (sum, f) =>
      sum +
      (f.cuotas
        ?.filter((c) => c.estado === "Pagada")
        .reduce((s, c) => s + c.monto, 0) || 0),
    0
  );

  const handleCrearFase = async () => {
    if (!nuevoNombre.trim()) {
      alert("Ingresá un nombre para la fase");
      return;
    }
    if (nuevoMonto <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }
    if (nuevoMonto > montoDisponible) {
      alert("El monto excede el disponible");
      return;
    }

    setLoading(true);
    await crearFase(
      presupuesto.id,
      nuevoNombre,
      nuevoMonto,
      fases.length + 1,
      new Date(nuevaFechaVencimiento + "T12:00:00").toISOString()
    );
    setNuevoNombre("");
    setNuevoMonto(0);
    setNuevaFechaVencimiento(new Date().toISOString().split("T")[0]);
    setShowCrear(false);
    await refetchFases();
    setLoading(false);
  };

  const handleUpdateFase = async (faseId: string, updates: Partial<Fase>) => {
    setLoading(true);
    await actualizarFase(faseId, updates);
    await refetchFases();
    setLoading(false);
  };

  const handleDeleteFase = async (faseId: string) => {
    setLoading(true);
    await eliminarFase(faseId);
    await refetchFases();
    setLoading(false);
  };

  // Verificar si el presupuesto está aceptado
  if (presupuesto.estado !== "Aceptado") {
    return (
      <div className="text-center py-10">
        <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
        <h4 className="text-lg font-semibold text-gray-700">
          Presupuesto no aceptado
        </h4>
        <p className="text-gray-500 mt-2">
          Para gestionar fases y cuotas, primero debés cambiar el estado del
          presupuesto a <strong>Aceptado</strong> en la pestaña Editar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen del presupuesto */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
        <div className="grid grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Total
            </p>
            <p className="text-xl font-bold text-gray-800">
              {formatCurrency(montoTotal, divisa)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Asignado
            </p>
            <p className="text-xl font-bold text-blue-600">
              {formatCurrency(montoAsignado, divisa)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Disponible
            </p>
            <p
              className={`text-xl font-bold ${
                montoDisponible > 0 ? "text-green-600" : "text-gray-400"
              }`}
            >
              {formatCurrency(montoDisponible, divisa)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Cobrado
            </p>
            <p className="text-xl font-bold text-emerald-600">
              {formatCurrency(montoPagado, divisa)}
            </p>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progreso de asignación</span>
            <span>{porcentajeAsignado.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${Math.min(porcentajeAsignado, 100)}%` }}
            />
          </div>
        </div>

        {/* Info de cuotas */}
        {totalCuotas > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-100 flex items-center gap-2 text-sm text-gray-600">
            <Info size={14} />
            <span>
              {cuotasPagadas} de {totalCuotas} cuotas pagadas
            </span>
          </div>
        )}
      </div>

      {/* Lista de fases */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700">Fases ({fases.length})</h4>

        {fases.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-xl">
            <p>No hay fases creadas</p>
            <p className="text-sm mt-1">
              Creá fases para dividir el presupuesto en partes
            </p>
          </div>
        ) : (
          fases.map((fase, index) => (
            <FaseCard
              key={fase.id}
              fase={fase}
              divisa={divisa}
              presupuestoId={presupuesto.id}
              projectName={selectedProject.title}
              index={index}
              loading={loading}
              onUpdate={handleUpdateFase}
              onDelete={handleDeleteFase}
              onRefreshFases={refetchFases}
            />
          ))
        )}
      </div>

      {/* Crear nueva fase */}
      {showCrear ? (
        <div className="bg-gray-50 p-4 rounded-xl border space-y-4">
          <h5 className="font-medium">Nueva fase</h5>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Nombre</label>
              <input
                type="text"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej: Diseño, Desarrollo, Entrega..."
                className="w-full border rounded-xl px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                Monto (disponible: {formatCurrency(montoDisponible, divisa)})
              </label>
              <input
                type="number"
                value={nuevoMonto || ""}
                onChange={(e) => setNuevoMonto(Number(e.target.value))}
                max={montoDisponible}
                className="w-full border rounded-xl px-3 py-2 mt-1"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Fecha vencimiento</label>
              <input
                type="date"
                value={nuevaFechaVencimiento}
                onChange={(e) => setNuevaFechaVencimiento(e.target.value)}
                className="w-full border rounded-xl px-3 py-2 mt-1"
              />
            </div>
          </div>

          {/* Sugerencias rápidas */}
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Sugerencias:</span>
            {[
              { label: "50%", value: montoDisponible * 0.5 },
              { label: "33%", value: montoDisponible * 0.33 },
              { label: "25%", value: montoDisponible * 0.25 },
              { label: "Todo", value: montoDisponible },
            ].map((sug) => (
              <button
                key={sug.label}
                onClick={() => setNuevoMonto(Math.floor(sug.value))}
                className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                disabled={montoDisponible <= 0}
              >
                {sug.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setShowCrear(false);
                setNuevoNombre("");
                setNuevoMonto(0);
              }}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrearFase}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !nuevoNombre.trim() || nuevoMonto <= 0}
            >
              Crear fase
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowCrear(true)}
          disabled={montoDisponible <= 0}
          className={`w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition ${
            montoDisponible > 0
              ? "border-blue-300 text-blue-600 hover:border-blue-400 hover:bg-blue-50"
              : "border-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <Plus size={18} />
          {montoDisponible > 0
            ? "Agregar fase"
            : "Todo el presupuesto está asignado"}
        </button>
      )}
    </div>
  );
}
