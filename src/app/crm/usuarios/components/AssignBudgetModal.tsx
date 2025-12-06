// components/AssignBudgetModal.tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "../page";

type Document = {
  id: string;
  name: string;
};

type AssignBudgetModalProps = {
  show: boolean;
  projects: Project[];
  clientNombre: string;
  onClose: () => void;
  refetchProfile: () => void;
};

export default function AssignBudgetModal({
  show,
  projects,
  clientNombre,
  onClose,
  refetchProfile,
}: AssignBudgetModalProps) {
  const { user } = useAuth();
  const supabase = createClient();

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [presupuestoEstado, setPresupuestoEstado] = useState("");
  const [presupuestoDivisa, setPresupuestoDivisa] = useState("USD");
  const [presupuesto, setPresupuesto] = useState("");
  const [anexo, setAnexo] = useState("");
  const [documentId, setDocumentId] = useState("");
  const [loading, setLoading] = useState(false);

  const [admins, setAdmins] = useState<{ id: string; nombre: string }[]>([]);
  const [assignedAdmins, setAssignedAdmins] = useState<string[]>([]);
  const [documentos, setDocumentos] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // Filtrar solo los que NO tienen presupuesto
  const projectsSinPresupuesto = projects.filter(
    (project) => project.presupuesto == null
  );

  // Cargar admins
  useEffect(() => {
    const fetchAdmins = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre, roles(rol)")
        .eq("role", "admin");

      if (error || !data) return;

      const flatAdmins = data.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        rol: (a.roles && "rol" in a.roles ? a.roles.rol : "") || "",
      }));

      const ceoCooAdmins = flatAdmins.filter(
        (a) => a.rol === "CEO" || a.rol === "COO"
      );

      setAdmins(ceoCooAdmins);
    };

    if (show) {
      fetchAdmins();
    }
  }, [show]);

  // Cargar documentos cuando se selecciona un proyecto
  useEffect(() => {
    const fetchDocumentos = async () => {
      if (!selectedProjectId) {
        setDocumentos([]);
        setDocumentId("");
        return;
      }

      setLoadingDocs(true);
      const { data, error } = await supabase
        .from("documents")
        .select("id, name")
        .eq("project_id", selectedProjectId)
        .eq("category_document", "Presupuesto");

      if (!error && data) {
        setDocumentos(data);
      }
      setLoadingDocs(false);
    };

    fetchDocumentos();
  }, [selectedProjectId]);

  const handleAdminCheck = (adminId: string) => {
    setAssignedAdmins((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleSubmit = async () => {
    const p = Number(presupuesto) || 0;
    const a = Number(anexo) || 0;
    const presupuestoTotal = p + a;

    if (assignedAdmins.length < 2) {
      alert("Debés seleccionar mínimo 2 administradores");
      return;
    }
    if (presupuestoTotal <= 0 || !selectedProjectId) return;

    setLoading(true);
    try {
      // 1️⃣ Crear el presupuesto
      const { data: presupuestoCreado, error } = await supabase
        .from("presupuestos")
        .insert([
          {
            divisa: presupuestoDivisa,
            monto: presupuestoTotal,
            estado: presupuestoEstado,
            project_id: selectedProjectId,
            document_id: documentId || null, // ← Nuevo campo
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // 2️⃣ Crear una fila en presupuestos_employees por cada admin seleccionado
      const inserts = assignedAdmins.map((adminId) => ({
        presupuestos_id: presupuestoCreado.id,
        user_id: adminId,
      }));

      const { error: errorEmployees } = await supabase
        .from("presupuestos_employees")
        .insert(inserts);

      if (errorEmployees) throw errorEmployees;

      // 3️⃣ Registrar en historial
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

      // Limpiar inputs y cerrar modal
      resetForm();
      refetchProfile();
      onClose();
    } catch (err) {
      console.error("Error asignando presupuesto:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedProjectId("");
    setPresupuesto("");
    setPresupuestoEstado("");
    setPresupuestoDivisa("USD");
    setAnexo("");
    setDocumentId("");
    setAssignedAdmins([]);
    setDocumentos([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!show) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 cursor-default max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Asignar presupuesto a un proyecto
        </h3>

        <div className="space-y-4">
          {/* Proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proyecto *
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
            >
              <option value="" disabled>
                Seleccionar proyecto
              </option>
              {projectsSinPresupuesto.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            {projectsSinPresupuesto.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                Todos los proyectos ya tienen presupuesto asignado
              </p>
            )}
          </div>

          {/* Documento vinculado */}
          {selectedProjectId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documento de presupuesto
              </label>
              {loadingDocs ? (
                <p className="text-sm text-gray-500">Cargando documentos...</p>
              ) : documentos.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No hay documentos de tipo Presupuesto en este proyecto
                </p>
              ) : (
                <select
                  value={documentId}
                  onChange={(e) => setDocumentId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-xl"
                >
                  <option value="">Sin documento vinculado</option>
                  {documentos.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado *
            </label>
            <select
              value={presupuestoEstado}
              onChange={(e) => setPresupuestoEstado(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
            >
              <option value="" disabled>
                Seleccionar Estado
              </option>
              <option value="En revisión">En revisión</option>
              <option value="Aceptado">Aceptado</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>

          {/* Divisa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Divisa
            </label>
            <select
              value={presupuestoDivisa}
              onChange={(e) => setPresupuestoDivisa(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Presupuesto *
            </label>
            <input
              type="number"
              placeholder="Monto del presupuesto"
              value={presupuesto}
              onChange={(e) => setPresupuesto(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>

          {/* Anexo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anexo (opcional)
            </label>
            <input
              type="number"
              placeholder="Se suma al presupuesto"
              value={anexo}
              onChange={(e) => setAnexo(e.target.value)}
              className="w-full px-4 py-2 border rounded-xl"
            />
          </div>

          {/* Total */}
          {(presupuesto || anexo) && (
            <div className="bg-blue-50 p-3 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Total:</strong> {presupuestoDivisa} $
                {(
                  Number(presupuesto || 0) + Number(anexo || 0)
                ).toLocaleString()}
              </p>
            </div>
          )}

          {/* Administradores */}
          <div className="border p-3 rounded-xl">
            <p className="text-sm font-medium mb-2">
              Seleccionar administradores: *
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {admins.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Cargando administradores...
                </p>
              ) : (
                admins.map((admin) => (
                  <label
                    key={admin.id}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={assignedAdmins.includes(admin.id)}
                      onChange={() => handleAdminCheck(admin.id)}
                      className="rounded"
                    />
                    <span className="text-gray-700">{admin.nombre}</span>
                  </label>
                ))
              )}
            </div>
            <p
              className={`text-xs mt-2 ${
                assignedAdmins.length < 2 ? "text-amber-600" : "text-green-600"
              }`}
            >
              {assignedAdmins.length < 2
                ? `Seleccionados: ${assignedAdmins.length}/2 (mínimo 2)`
                : `Seleccionados: ${assignedAdmins.length} ✓`}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl cursor-pointer"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            disabled={
              loading ||
              (!presupuesto && !anexo) ||
              !selectedProjectId ||
              !presupuestoEstado ||
              assignedAdmins.length < 2
            }
          >
            {loading ? "Asignando…" : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
