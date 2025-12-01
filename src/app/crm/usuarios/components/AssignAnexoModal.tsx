"use client";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

type AssignBudgetModalProps = {
  show: boolean;
  projects: {
    id: string;
    title: string;
    presupuestos: [
      {
        monto: number;
        estado: string;
        divisa: string;
        profiles?: { nombre?: string } | null;
      }
    ];
  }[];
  clientNombre: string;
  onClose: () => void;
};

export default function AssignAnexoModal({
  show,
  projects,
  clientNombre,
  onClose,
}: AssignBudgetModalProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [presupuestoEstado, setPresupuestoEstado] = useState("");
  const [userPresupuesto, setUserPresupuesto] = useState("");
  const [anexo, setAnexo] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Filtro corregido (ahora filtra bien por monto > 0)
  const projectsConPresupuesto = projects.filter(
    (p) => Array.isArray(p.presupuestos) && (p.presupuestos[0]?.monto ?? 0) > 0
  );

  // 🔥 Preseleccionar estado cuando cambia el proyecto seleccionado
  useEffect(() => {
    if (!selectedProjectId) return;

    const proyecto = projects.find((p) => p.id === selectedProjectId);

    setPresupuestoEstado(proyecto?.presupuestos[0]?.estado ?? "No Presentado");
  }, [selectedProjectId, projects]);

  const handleSubmit = async () => {
    if (!selectedProjectId || loading) return;

    const a = Number(anexo) || 0;
    const proyecto = projects.find((p) => p.id === selectedProjectId);
    const presupuestoActual = proyecto?.presupuestos?.[0]?.monto ?? 0;
    const presupuestoTotal = presupuestoActual + a;

    if (presupuestoTotal <= 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("presupuestos")
        .update({
          monto: presupuestoTotal,
          estado: presupuestoEstado,
        })
        .eq("project_id", selectedProjectId);

      if (error) throw error;

      const { error: ingresoError } = await supabase
        .from("Ingresos")
        .update({ Ingreso: presupuestoTotal })
        .eq("project_id", selectedProjectId);

      if (ingresoError) throw ingresoError;

      const { error: errorHistory } = await supabase
        .from("historial_actividad")
        .insert([
          {
            usuario_modificador_id: user?.id,
            accion: "Agregó un anexo de presupuesto",
            usuario_modificado: clientNombre,
            seccion: "Usuarios",
            project_id: selectedProjectId,
            anexo_monto: a,
            estado_prev: proyecto?.presupuestos?.[0]?.estado,
            estado_new: presupuestoEstado,
          },
        ]);

      if (errorHistory) throw errorHistory;

      setSelectedProjectId("");
      setAnexo("");
      onClose();
    } catch (err) {
      console.error("Error asignando presupuesto:", err);
    } finally {
      setLoading(false);
    }
  };
  if (!show) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 cursor-default"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Asignar anexo de presupuesto
        </h3>

        <div className="space-y-3">
          {/* Seleccionar proyecto */}
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          >
            <option value="" disabled>
              Seleccionar proyecto
            </option>
            {projectsConPresupuesto.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} - {p.presupuestos[0]?.divisa} $
                {p.presupuestos[0]?.monto?.toLocaleString("es-AR")} (
                {p.presupuestos[0]?.estado})
              </option>
            ))}
          </select>

          {/* Estado del presupuesto (ya viene preseleccionado) */}
          <select
            value={presupuestoEstado}
            onChange={(e) => setPresupuestoEstado(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          >
            <option value="" disabled>
              Seleccionar Estado
            </option>
            <option value="Presentado">Presentado</option>
            <option value="No presentado">No Presentado</option>
            <option value="Aceptado">Aceptado</option>
          </select>

          {/* Input del anexo */}
          <input
            type="number"
            placeholder="Anexo"
            value={anexo}
            onChange={(e) => setAnexo(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl disabled:opacity-50"
            disabled={loading || !anexo || !selectedProjectId}
          >
            {loading ? "Asignando…" : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
