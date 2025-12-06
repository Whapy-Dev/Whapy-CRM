// components/CreateBudgetForm.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Admin, EstadoPresupuesto, Document } from "../types";
import { Project } from "../../../page";

interface CreateBudgetFormProps {
  selectedProject: Project;
  admins: Admin[];
  documents: Document[];
  clientNombre: string;
  onClose: () => void;
  refetchProfile: () => void;
}

export default function CreateBudgetForm({
  selectedProject,
  admins,
  documents,
  clientNombre,
  onClose,
  refetchProfile,
}: CreateBudgetFormProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [presupuestoEstado, setPresupuestoEstado] = useState<
    EstadoPresupuesto | ""
  >("");
  const [presupuesto, setPresupuesto] = useState("");
  const [anexo, setAnexo] = useState("");
  const [assignedAdmins, setAssignedAdmins] = useState<string[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");

  const handleAdminCheck = (adminId: string) => {
    setAssignedAdmins((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleCreateBudget = async () => {
    const p = Number(presupuesto) || 0;
    const a = Number(anexo) || 0;
    const presupuestoTotal = p + a;

    if (assignedAdmins.length < 1) {
      alert("Debés seleccionar mínimo 1 administrador");
      return;
    }
    if (presupuestoTotal <= 0) return;
    if (!presupuestoEstado) {
      alert("Debés seleccionar un estado");
      return;
    }
    if (!selectedDocumentId) {
      alert("Debes seleccionar un documento para el presupuesto");
      return;
    }
    setLoading(true);

    try {
      // 1. Crear presupuesto con document_id
      const { data: presupuestoCreado, error } = await supabase
        .from("presupuestos")
        .insert([
          {
            divisa: "USD",
            monto: presupuestoTotal,
            estado: presupuestoEstado,
            project_id: selectedProject.id,
            document_id: selectedDocumentId || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 2. Asignar administradores
      const inserts = assignedAdmins.map((adminId) => ({
        presupuestos_id: presupuestoCreado.id,
        user_id: adminId,
      }));

      const { error: errorEmployees } = await supabase
        .from("presupuestos_employees")
        .insert(inserts);

      if (errorEmployees) throw errorEmployees;

      // 3. Registrar en historial
      const { error: errorHistory } = await supabase
        .from("historial_actividad")
        .insert([
          {
            usuario_modificador_id: user?.id,
            accion: "Creó un presupuesto",
            usuario_modificado: clientNombre,
            seccion: "Usuarios",
          },
        ]);

      if (errorHistory) throw errorHistory;

      refetchProfile();
      onClose();
    } catch (err) {
      console.error("Error asignando presupuesto:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h4 className="text-lg font-semibold">
        Crear presupuesto para: {selectedProject.title}
      </h4>

      <div className="space-y-3">
        {/* Selector de documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Documento de presupuesto
          </label>
          <select
            value={selectedDocumentId}
            onChange={(e) => setSelectedDocumentId(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          >
            <option value="">Sin documento vinculado</option>
            {documents.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>
          {documents.length === 0 && (
            <p className="text-xs text-gray-500 mt-1">
              No hay documentos de tipo Presupuestos en este proyecto
            </p>
          )}
        </div>

        <select
          value={presupuestoEstado}
          onChange={(e) =>
            setPresupuestoEstado(e.target.value as EstadoPresupuesto)
          }
          className="w-full px-4 py-2 border rounded-xl"
        >
          <option value="" disabled>
            Seleccionar Estado
          </option>
          <option value="Sin presentar">Sin presentar</option>
          <option value="Rechazado">Rechazado</option>
          <option value="En revisión">En revisión</option>
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
          placeholder="Anexo inicial (opcional)"
          value={anexo}
          onChange={(e) => setAnexo(e.target.value)}
          className="w-full px-4 py-2 border rounded-xl"
        />

        <div className="border p-3 rounded-xl">
          <p className="text-sm font-medium mb-2">
            Seleccionar administradores:
          </p>
          <div className="max-h-40 overflow-y-auto space-y-2">
            {admins.map((admin) => (
              <label key={admin.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={assignedAdmins.includes(admin.id)}
                  onChange={() => handleAdminCheck(admin.id)}
                />
                <span className="text-gray-700">{admin.nombre}</span>
              </label>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Debés seleccionar al menos 1
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl cursor-pointer"
          disabled={loading}
        >
          Cancelar
        </button>

        <button
          onClick={handleCreateBudget}
          className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
          disabled={loading || (!presupuesto && !anexo)}
        >
          {loading ? "Asignando…" : "Asignar presupuesto"}
        </button>
      </div>
    </>
  );
}
