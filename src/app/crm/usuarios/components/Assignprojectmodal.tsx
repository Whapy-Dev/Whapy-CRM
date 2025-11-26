"use client";

import { useState } from "react";
import { Client } from "../page";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle } from "lucide-react";

type AssignProjectModalProps = {
  show: boolean;
  client: Client | null;
  onClose: () => void;
  refetchProfile: () => void;
};

export default function AssignProjectModal({
  show,
  client,
  onClose,
  refetchProfile,
}: AssignProjectModalProps) {
  const [title, setTitle] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setErrorForm("");
    setLoading(true);
    setSuccess(false);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        setErrorForm("Error al obtener usuario");
        return;
      }

      if (!user) {
        setErrorForm("No hay usuario logeado");
        return;
      }

      if (!title || !descripcion || !status || !progress) {
        setErrorForm("Por favor completa todos los campos");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            user_id: client?.id,
            title: title,
            descripcion: descripcion,
            status: status,
            progress: progress,
          },
        ])
        .select(); // Esto devuelve el registro insertado

      if (error) {
        console.error("Error al crear el proyecto:", error);
      } else if (data && data.length > 0) {
        const newProjectId = data[0].id;

        // Asignar el proyecto al cliente en project_users
        const { error: assignError } = await supabase
          .from("project_users")
          .insert([
            {
              project_id: newProjectId,
              user_id: client?.id,
              type: "Principal",
            },
          ]);
        if (assignError) throw assignError;
        const { error } = await supabase.from("historial_actividad").insert([
          {
            usuario_modificador_id: user?.id,
            accion: "Creo un nuevo proyecto",
            usuario_modificado: client?.nombre,
            seccion: "Usuarios",
          },
        ]);

        if (error) throw error;

        setSuccess(true);

        // ✅ Usar refetchProfiles
        await refetchProfile();

        setTitle("");
        setDescripcion("");
        setStatus("");
        setProgress("");

        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 500);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error al crear nuevo proyecto:", err);
      setErrorForm(
        "Ocurrió un error inesperado. Por favor, intenta nuevamente."
      );
      setLoading(false);
    }
  };
  if (!show || !client) return null;
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Nuevo Proyecto</h2>
        <form onSubmit={handleNewProject} className="space-y-4">
          {errorForm && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errorForm}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Proyecto creado con exito
              </p>
            </div>
          )}

          <div className="relative">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Titulo
            </label>
            <input
              type="text"
              value={title}
              id="title"
              name="title"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Proyecto Nuevo"
              required
            />
          </div>
          <div>
            <label
              htmlFor="descripcion"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Descripcion
            </label>
            <input
              type="text"
              name="descripcion"
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripcion de proyecto"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado del Proyecto
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 bg-white"
            >
              <option value="">Seleccionar...</option>
              <option value="En progreso">En progreso</option>
              <option value="Terminado">Terminado</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Pausado">Pausado</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="progress"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Progreso
            </label>
            <input
              type="text"
              name="progress"
              id="progress"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: 60"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                loading ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Cargando" : "Crear Proyecto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
