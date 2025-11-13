import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Project } from "../page";
import { useQueryClient } from "@tanstack/react-query";

type EditProjectModalProps = {
  show: boolean;
  project: Project | null;
  onClose: () => void;
  refetchProfiles: () => void;
};

export default function EditProjectModal({
  show,
  project,
  onClose,
  refetchProfiles,
}: EditProjectModalProps) {
  const queryClient = useQueryClient();
  const [editProjectTitle, setEditProjectTitle] = useState("");
  const [editProjectDescripcion, setEditProjectDescripcion] = useState("");
  const [editProjectEstado, setEditProjectEstado] = useState("");
  const [editProjectProgress, setEditProjectProgress] = useState("");
  const [errorFormEditProject, setErrorFormEditProject] = useState("");
  const [loadingEditProject, setLoadingEditProject] = useState(false);
  const [successFormEditProject, setSuccessFormEditProject] = useState(false);

  // 📹 Cuando se abre el modal o cambia el proyecto, rellenar los campos
  useEffect(() => {
    if (project) {
      setEditProjectTitle(project.title || "");
      setEditProjectDescripcion(project.descripcion || "");
      setEditProjectEstado(project.status || "");
      setEditProjectProgress(String(project.progress || ""));
    }
  }, [project]);

  const handleEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorFormEditProject("");
    setLoadingEditProject(true);
    setSuccessFormEditProject(false);

    try {
      const supabase = createClient();
      if (!project) {
        setErrorFormEditProject("No se seleccionó ningún proyecto.");
        setLoadingEditProject(false);
        return;
      }

      const { error } = await supabase
        .from("projects")
        .update({
          title: editProjectTitle,
          descripcion: editProjectDescripcion,
          status: editProjectEstado,
          progress: Number(editProjectProgress),
        })
        .eq("id", project.id);

      if (error) {
        console.error(error);
        setErrorFormEditProject("Error al editar proyecto");
      } else {
        setSuccessFormEditProject(true);

        await refetchProfiles();
        // 📹 Cerrar el modal automáticamente tras 1.5 segundos
        setTimeout(() => {
          setSuccessFormEditProject(false);
          onClose();
        }, 1500);
      }
    } catch (err) {
      console.error("Error al editar proyecto:", err);
      setErrorFormEditProject(
        "Ocurrió un error inesperado. Por favor, intenta nuevamente."
      );
    } finally {
      setLoadingEditProject(false);
    }
  };

  if (!show || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <h3 className="text-xl font-bold mb-4">
          Editar proyecto: {project.title}
        </h3>

        {errorFormEditProject && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errorFormEditProject}</p>
          </div>
        )}

        {successFormEditProject && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            Cambios guardados correctamente
          </div>
        )}

        <form onSubmit={handleEditProject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              value={editProjectTitle}
              onChange={(e) => setEditProjectTitle(e.target.value)}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <input
              value={editProjectDescripcion}
              onChange={(e) => setEditProjectDescripcion(e.target.value)}
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={editProjectEstado}
              onChange={(e) => setEditProjectEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Editar estado</option>
              <option value="En progreso">En progreso</option>
              <option value="Terminado">Terminado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Pausado">Pausado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Progreso
            </label>
            <input
              value={editProjectProgress}
              onChange={(e) => setEditProjectProgress(e.target.value)}
              type="number"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg font-medium hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingEditProject}
              className={`px-4 py-2 rounded-lg text-white font-medium ${
                loadingEditProject
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loadingEditProject ? "Actualizando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
