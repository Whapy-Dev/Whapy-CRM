// tabs/EditarTab.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { EstadoPresupuesto, formatCurrency } from "../types";
import { Project } from "@/utils/types";
import { Edit2, Check, X } from "lucide-react";

interface EditarTabProps {
  selectedProject: Project;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refetchProfile: () => void;
  onClose: () => void;
}

export default function EditarTab({
  selectedProject,
  loading,
  setLoading,
  refetchProfile,
  onClose,
}: EditarTabProps) {
  const supabase = createClient();
  const presupuesto = selectedProject.presupuesto;

  const [estado, setEstado] = useState<EstadoPresupuesto>(
    (presupuesto?.estado as EstadoPresupuesto) || "Sin presentar"
  );
  const [montoTotal, setMontoTotal] = useState<number>(presupuesto?.monto || 0);

  // Estados para edición de monto
  const [editandoMonto, setEditandoMonto] = useState(false);
  const [nuevoMonto, setNuevoMonto] = useState<number>(presupuesto?.monto || 0);

  // Actualizar cuando cambia el presupuesto
  useEffect(() => {
    if (presupuesto) {
      setEstado(presupuesto.estado as EstadoPresupuesto);
      setMontoTotal(presupuesto.monto);
      setNuevoMonto(presupuesto.monto);
    }
  }, [presupuesto?.id, presupuesto?.estado, presupuesto?.monto]);

  const handleUpdateEstado = async () => {
    if (!presupuesto) return;
    setLoading(true);

    try {
      const { error } = await supabase
        .from("presupuestos")
        .update({ estado })
        .eq("id", presupuesto.id);

      if (error) throw error;

      await refetchProfile();
    } catch (error) {
      console.error("Error actualizando estado:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMonto = async () => {
    if (!presupuesto) return;
    if (nuevoMonto <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("presupuestos")
        .update({ monto: nuevoMonto })
        .eq("id", presupuesto.id);

      if (error) throw error;

      setMontoTotal(nuevoMonto);
      setEditandoMonto(false);
      await refetchProfile();
    } catch (error) {
      console.error("Error actualizando monto:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEditMonto = () => {
    setNuevoMonto(montoTotal);
    setEditandoMonto(false);
  };

  const handleDeleteBudget = async () => {
    if (!presupuesto) return;

    const confirmDelete = window.confirm(
      "¿Estás seguro de eliminar este presupuesto? Se eliminarán todas las fases, cuotas y anexos asociados."
    );
    if (!confirmDelete) return;

    setLoading(true);

    try {
      // 1. Obtener IDs de cuotas para eliminar ingresos
      const { data: cuotas } = await supabase
        .from("pago_cuotas")
        .select("id")
        .eq("presupuesto_id", presupuesto.id);

      if (cuotas && cuotas.length > 0) {
        const cuotaIds = cuotas.map((c) => c.id);
        // Eliminar ingresos relacionados
        await supabase.from("Ingresos").delete().in("pago_cuotas_id", cuotaIds);
      }

      // 2. Eliminar anexos
      await supabase
        .from("anexos")
        .delete()
        .eq("presupuesto_id", presupuesto.id);

      // 3. Eliminar employees
      await supabase
        .from("presupuestos_employees")
        .delete()
        .eq("presupuestos_id", presupuesto.id);

      // 4. Eliminar cuotas
      await supabase
        .from("pago_cuotas")
        .delete()
        .eq("presupuesto_id", presupuesto.id);

      // 5. Eliminar fases
      await supabase
        .from("fases")
        .delete()
        .eq("presupuesto_id", presupuesto.id);

      // 6. Eliminar presupuesto
      await supabase.from("presupuestos").delete().eq("id", presupuesto.id);

      refetchProfile();
      onClose();
    } catch (error) {
      console.error("Error eliminando presupuesto:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!presupuesto) return null;

  return (
    <div className="space-y-4">
      {/* Info del presupuesto */}
      <div className="bg-gray-50 p-4 rounded-xl">
        <div className="grid grid-cols-2 gap-4">
          {/* Monto editable */}
          <div>
            <p className="text-sm text-gray-500 mb-1">Monto total</p>
            {editandoMonto ? (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={nuevoMonto}
                  onChange={(e) => setNuevoMonto(Number(e.target.value))}
                  className="text-2xl font-bold w-40 border rounded px-2 py-1"
                  min={0}
                />
                <button
                  onClick={handleUpdateMonto}
                  className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={loading}
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={handleCancelEditMonto}
                  className="p-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {formatCurrency(montoTotal, presupuesto.divisa)}
                </p>
                <button
                  onClick={() => setEditandoMonto(true)}
                  className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Editar monto"
                >
                  <Edit2 size={18} />
                </button>
              </div>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-500">Divisa</p>
            <p className="text-lg font-semibold">{presupuesto.divisa}</p>
          </div>
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="font-medium">Estado del presupuesto</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value as EstadoPresupuesto)}
          className="w-full border p-2 rounded-xl mt-1"
        >
          <option value="Sin presentar">Sin presentar</option>
          <option value="En revisión">En revisión</option>
          <option value="Rechazado">Rechazado</option>
          <option value="Aceptado">Aceptado</option>
        </select>
      </div>

      {/* Mensaje informativo si está aceptado */}
      {estado === "Aceptado" && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
          <p className="text-green-800 text-sm">
            ✅ El presupuesto está aceptado. Podés gestionar las fases y cuotas
            en la pestaña <strong>Fases y Cuotas</strong>.
          </p>
        </div>
      )}

      {/* Botón guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleUpdateEstado}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Guardando…" : "Guardar estado"}
        </button>
      </div>

      <div className="border-t pt-4 mt-6">
        <button
          onClick={handleDeleteBudget}
          className="w-full px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition cursor-pointer"
          disabled={loading}
        >
          Borrar presupuesto
        </button>
      </div>
    </div>
  );
}
