import { useState } from "react";
import { Client, Project } from "../page";
import { createClient } from "@/lib/supabase/client";
import { PostgrestError } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";

type DeleteProjectModalProps = {
  project: Project;
  client: Client;
  show: boolean;
  onClose: () => void;
  refetchProfile: () => void;
};

export default function DeleteProjectModal({
  project,
  client,
  show,
  onClose,
  refetchProfile,
}: DeleteProjectModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();
  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      // 1️⃣ Borrar relaciones del proyecto en project_users
      const { error: projectUsersError } = await supabase
        .from("project_users")
        .delete()
        .eq("project_id", project.id);

      if (projectUsersError) throw projectUsersError;

      // 2️⃣ Eliminar videos
      const { error: videoError } = await supabase
        .from("videos")
        .delete()
        .eq("project_id", project.id);

      if (videoError) throw videoError;

      // 3️⃣ Eliminar documentos
      const { error: docError } = await supabase
        .from("documents")
        .delete()
        .eq("project_id", project.id);

      if (docError) throw docError;

      // 4️⃣ Eliminar proyecto
      const { error: projectError } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id);

      if (projectError) throw projectError;

      // 5️⃣ Registrar en historial
      const { error: errorDb } = await supabase
        .from("historial_actividad")
        .insert([
          {
            usuario_modificador_id: user?.id,
            accion: "Eliminó un proyecto",
            usuario_modificado: client?.nombre,
            seccion: "Proyectos",
          },
        ]);

      if (errorDb) throw errorDb;

      refetchProfile();
      onClose();
    } catch (err) {
      const supabaseError = err as PostgrestError;
      setError(supabaseError.message || "Ocurrió un error al eliminar");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
        <h3 className="text-xl font-semibold mb-4">Eliminar proyecto</h3>
        <p className="mb-4 text-gray-700">
          ¿Estás seguro que deseas eliminar el proyecto{" "}
          <strong>{project.title}</strong>? Esto también eliminará todos los
          videos y documentos asociados.
        </p>
        {error && <p className="text-red-500 mb-2">{error}</p>}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 cursor-pointer"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 cursor-pointer"
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
