// components/FaseCard.tsx
"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Edit2,
  Check,
  X,
  Calendar,
} from "lucide-react";
import { Fase, EstadoFase, formatCurrency } from "../types";
import CuotasManager from "./CuotasManager";

interface FaseCardProps {
  fase: Fase;
  divisa: string;
  presupuestoId: string;
  projectName: string;
  index: number;
  loading: boolean;
  onUpdate: (faseId: string, updates: Partial<Fase>) => Promise<void>;
  onDelete: (faseId: string) => Promise<void>;
  onRefreshFases: () => Promise<void>;
}

const estadoColors: Record<EstadoFase, string> = {
  Pendiente: "bg-yellow-100 text-yellow-800",
  "En progreso": "bg-blue-100 text-blue-800",
  Completada: "bg-green-100 text-green-800",
};

export default function FaseCard({
  fase,
  divisa,
  presupuestoId,
  projectName,
  index,
  loading,
  onUpdate,
  onDelete,
  onRefreshFases,
}: FaseCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editNombre, setEditNombre] = useState(fase.nombre);
  const [editMonto, setEditMonto] = useState(fase.monto);
  const [editEstado, setEditEstado] = useState<EstadoFase>(
    fase.estado as EstadoFase
  );
  const [editFechaVencimiento, setEditFechaVencimiento] = useState(
    fase.fecha_vencimiento
      ? new Date(fase.fecha_vencimiento).toISOString().split("T")[0]
      : ""
  );

  const cuotasPagadas =
    fase.cuotas?.filter((c) => c.estado === "Pagada").length || 0;
  const totalCuotas = fase.cuotas?.length || 0;
  const montoPagado =
    fase.cuotas
      ?.filter((c) => c.estado === "Pagada")
      .reduce((sum, c) => sum + c.monto, 0) || 0;

  const handleSaveEdit = async () => {
    await onUpdate(fase.id, {
      nombre: editNombre,
      monto: editMonto,
      estado: editEstado,
      fecha_vencimiento: editFechaVencimiento
        ? new Date(editFechaVencimiento + "T12:00:00").toISOString()
        : null,
    });
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditNombre(fase.nombre);
    setEditMonto(fase.monto);
    setEditEstado(fase.estado as EstadoFase);
    setEditFechaVencimiento(
      fase.fecha_vencimiento
        ? new Date(fase.fecha_vencimiento).toISOString().split("T")[0]
        : ""
    );
    setEditing(false);
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `¿Eliminar "${fase.nombre}"? Se eliminarán todas sus cuotas.`
    );
    if (confirmDelete) {
      await onDelete(fase.id);
    }
  };

  const formatFecha = (fecha: string | null | undefined) => {
    if (!fecha) return "Sin fecha";
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Header de la fase */}
      <div
        className={`p-4 cursor-pointer transition ${
          expanded ? "bg-gray-50" : "hover:bg-gray-50"
        }`}
        onClick={() => !editing && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {index + 1}
            </span>

            {editing ? (
              <input
                type="text"
                value={editNombre}
                onChange={(e) => setEditNombre(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="border rounded px-2 py-1 font-semibold"
              />
            ) : (
              <div>
                <h5 className="font-semibold text-lg">{fase.nombre}</h5>
                {fase.fecha_vencimiento && (
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={12} />
                    Vence: {formatFecha(fase.fecha_vencimiento)}
                  </p>
                )}
              </div>
            )}

            {editing ? (
              <select
                value={editEstado}
                onChange={(e) => setEditEstado(e.target.value as EstadoFase)}
                onClick={(e) => e.stopPropagation()}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="En progreso">En progreso</option>
                <option value="Completada">Completada</option>
              </select>
            ) : (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  estadoColors[fase.estado as EstadoFase]
                }`}
              >
                {fase.estado}
              </span>
            )}
          </div>

          <div className="flex items-center gap-4">
            {editing ? (
              <div
                className="flex items-center gap-2 flex-wrap"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <label className="text-xs text-gray-500">Monto</label>
                  <input
                    type="number"
                    value={editMonto}
                    onChange={(e) => setEditMonto(Number(e.target.value))}
                    className="border rounded px-2 py-1 w-28"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Vencimiento</label>
                  <input
                    type="date"
                    value={editFechaVencimiento}
                    onChange={(e) => setEditFechaVencimiento(e.target.value)}
                    className="border rounded px-2 py-1"
                  />
                </div>
                <button
                  onClick={handleSaveEdit}
                  className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  disabled={loading}
                >
                  <Check size={16} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {formatCurrency(fase.monto, divisa)}
                  </p>
                  {totalCuotas > 0 && (
                    <p className="text-xs text-gray-500">
                      {cuotasPagadas}/{totalCuotas} cuotas •{" "}
                      {formatCurrency(montoPagado, divisa)} pagado
                    </p>
                  )}
                </div>

                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => setEditing(true)}
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    disabled={loading}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {expanded ? (
                  <ChevronUp size={20} className="text-gray-400" />
                ) : (
                  <ChevronDown size={20} className="text-gray-400" />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Contenido expandido - Cuotas */}
      {expanded && !editing && (
        <div className="border-t p-4 bg-gray-50 ">
          <CuotasManager
            fase={fase}
            divisa={divisa}
            presupuestoId={presupuestoId}
            projectName={projectName}
            onRefresh={onRefreshFases}
          />
        </div>
      )}
    </div>
  );
}
