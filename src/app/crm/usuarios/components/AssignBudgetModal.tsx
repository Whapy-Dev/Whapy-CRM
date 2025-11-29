"use client";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { argentinaNow } from "../../pnl/components/AgregarIngresoModal";

type AssignBudgetModalProps = {
  show: boolean;
  projects: { id: string; title: string; presupuesto?: number | null }[];
  onClose: () => void;
};

export default function AssignBudgetModal({
  show,
  projects,
  onClose,
}: AssignBudgetModalProps) {
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [anexo, setAnexo] = useState("");
  const [loading, setLoading] = useState(false);

  if (!show) return null;

  const handleSubmit = async () => {
    const supabase = createClient();
    const p = Number(presupuesto) || 0;
    const a = Number(anexo) || 0;
    const presupuestoTotal = p + a;

    if (presupuestoTotal <= 0 || !selectedProjectId) return;

    setLoading(true);
    try {
      // Actualizamos el proyecto en Supabase
      const { error } = await supabase
        .from("projects")
        .update({ presupuesto: presupuestoTotal })
        .eq("id", selectedProjectId);

      if (error) throw error;

      // Insertamos el ingreso correspondiente
      const { error: ingresoError } = await supabase.from("Ingresos").insert({
        project_id: selectedProjectId,
        Ingreso: presupuestoTotal,
        Descripcion: "Proyecto",
        created_at: new Date(argentinaNow).toISOString(),
      });

      if (ingresoError) throw ingresoError;

      // Limpiar inputs y cerrar modal
      setSelectedProjectId("");
      setPresupuesto("");
      setAnexo("");
      onClose();
    } catch (err) {
      console.error("Error asignando presupuesto:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filtrar solo proyectos sin presupuesto
  const projectsSinPresupuesto = projects.filter(
    (p) => !p.presupuesto || p.presupuesto === 0
  );

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
          Asignar presupuesto a un proyecto
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
            {projectsSinPresupuesto.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Presupuesto"
            value={presupuesto}
            onChange={(e) => setPresupuesto(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          />

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
            disabled={loading || (!presupuesto && !anexo) || !selectedProjectId}
          >
            {loading ? "Asignando…" : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
