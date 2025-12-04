"use client";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Project } from "../page";

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

  const [presupuestoDivisa, setPresupuestoDivisa] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [anexo, setAnexo] = useState("");
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<{ id: string; nombre: string }[]>([]);
  const [assignedAdmins, setAssignedAdmins] = useState<string[]>([]);

  // 👇 Filtrar solo los que NO tienen presupuesto
  const projectsSinPresupuesto = projects.filter(
    (project) => project.presupuesto == null
  );
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

    fetchAdmins();
  }, []);
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
      const { data: presupuestoCreado, error } = await supabase
        .from("presupuestos")
        .insert([
          {
            divisa: presupuestoDivisa,
            monto: presupuestoTotal,
            estado: presupuestoEstado,
            project_id: selectedProjectId,
          },
        ])
        .select()
        .single(); // <-- para que devuelva 1 sola fila

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
      setSelectedProjectId("");
      setPresupuesto("");
      setPresupuestoEstado("");
      setPresupuestoDivisa("");
      setAnexo("");
      setAssignedAdmins([]);
      refetchProfile();
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
            {projectsSinPresupuesto.map((project) => (
              <option key={project.id} value={project.id}>
                {project.title}
              </option>
            ))}
          </select>

          <select
            value={presupuestoEstado}
            onChange={(e) => setPresupuestoEstado(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          >
            <option value="" disabled>
              Seleccionar Estado
            </option>
            <option value="Rechazado">Rechazado</option>
            <option value="En revisión">En revision</option>
          </select>
          <select
            value={presupuestoDivisa}
            onChange={(e) => setPresupuestoDivisa(e.target.value)}
            className="w-full px-4 py-2 border rounded-xl"
          >
            <option value="" disabled>
              Seleccionar Divisa
            </option>
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
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
              Debés seleccionar al menos 2
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl cursor-pointer"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
            disabled={loading || (!presupuesto && !anexo) || !selectedProjectId}
          >
            {loading ? "Asignando…" : "Asignar"}
          </button>
        </div>
      </div>
    </div>
  );
}
