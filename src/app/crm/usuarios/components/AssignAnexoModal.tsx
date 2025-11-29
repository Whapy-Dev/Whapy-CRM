"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type AssignBudgetModalProps = {
  show: boolean;
  projects: { id: string; title: string; presupuesto?: number | null }[];
  onClose: () => void;
};

export default function AssignAnexoModal({
  show,
  projects,
  onClose,
}: AssignBudgetModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [anexo, setAnexo] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  // ✅ Filtrar solo proyectos que ya tengan presupuesto
  const projectsConPresupuesto = projects.filter(
    (p) => p.presupuesto && p.presupuesto > 0
  );

  const handleSubmit = async () => {
    if (!selectedProjectId) return;

    const supabase = createClient();
    const a = Number(anexo) || 0;

    const proyecto = projects.find((p) => p.id === selectedProjectId);
    const presupuestoActual = proyecto?.presupuesto || 0;

    const presupuestoTotal = presupuestoActual + a;

    if (presupuestoTotal <= 0) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("projects")
        .update({ presupuesto: presupuestoTotal })
        .eq("id", selectedProjectId);

      if (error) throw error;

      const { error: ingresoError } = await supabase
        .from("Ingresos")
        .update({
          Ingreso: presupuestoTotal,
        })
        .eq("project_id", selectedProjectId);

      if (ingresoError) throw ingresoError;

      setSelectedProjectId("");
      setAnexo("");
      onClose();
    } catch (err) {
      console.error("Error asignando presupuesto:", err);
    } finally {
      setLoading(false);
    }
  };

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
                {p.title} - Actual: ${p.presupuesto || 0}
              </option>
            ))}
          </select>

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
            className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
            disabled={loading || !anexo || !selectedProjectId}
          >
            {loading ? "Asignando…" : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
