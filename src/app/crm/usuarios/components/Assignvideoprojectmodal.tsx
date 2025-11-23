import { useState } from "react";
import { Project } from "../page";
import { useUpload } from "@/context/UploadContext";

type AssignVideoModalProps = {
  show: boolean;
  project: Project | null;
  onClose: () => void;
  refetchProfile: () => void;
};

export default function AssignVideoModal({
  show,
  project,
  onClose,
  refetchProfile,
}: AssignVideoModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [titleMode, setTitleMode] = useState<"preset" | "custom">("preset");

  const [duration, setDuration] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [uploadType, setUploadType] = useState<"project" | "meeting" | "">("");
  const { startUpload, isUploading } = useUpload();
  if (!show || !project) return null;
  const handleUpload = async () => {
    // 1) Validación
    if (!file || !title || !descripcion || !duration || !uploadType) {
      alert("Por favor completa todos los campos antes de subir.");
      return;
    }

    // 2) Cerrar modal inmediatamente
    onClose();

    // 3) Lanzar la subida en segundo plano
    startUpload(
      file,
      {
        title,
        descripcion,
        duration,
        project_id: project.id,
        type_video: uploadType === "project" ? "Video informativo" : "Reunion",
      },
      () => {
        refetchProfile();
      }
    );

    // 4) Opcional: refrescar perfil sin esperar
    setTitle("");
    setDescripcion("");
    setDuration("");
    setFile(null);
    setUploadType("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border">
        <h4 className="text-lg font-semibold mb-4">Subir Video</h4>

        {/* Tipo de video */}
        <select
          value={uploadType}
          onChange={(e) =>
            setUploadType(e.target.value as "project" | "meeting" | "")
          }
          className="w-full mb-4 border p-3 rounded-xl"
        >
          <option value="">— Seleccionar tipo —</option>
          <option value="project">📁 Video Informativo (Proyecto)</option>
          <option value="meeting">📅 Video para Reunión</option>
        </select>

        {/* Selección de título */}
        <select
          value={
            title === "Reunión informativa" ||
            title === "Entrega de presupuesto"
              ? title
              : ""
          }
          onChange={(e) => {
            const value = e.target.value;

            if (value === "custom") {
              setTitleMode("custom");
              setTitle(""); // limpiar para escribir
            } else {
              setTitleMode("preset");
              setTitle(value);
            }
          }}
          className="w-full mb-3 border p-3 rounded-xl"
        >
          <option value="">— Seleccionar título —</option>
          <option value="Reunión informativa">Reunión informativa</option>
          <option value="Entrega de presupuesto">Entrega de presupuesto</option>
          <option value="custom">Escribir título manualmente</option>
        </select>

        {/* Input manual SOLO si se elige custom */}
        {titleMode === "custom" && (
          <input
            type="text"
            placeholder="Escribir título manualmente"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-3 border p-3 rounded-xl"
          />
        )}

        <input
          type="text"
          placeholder="Duración (min)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full mb-3 border p-3 rounded-xl"
        />

        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full mb-3 border p-3 rounded-xl"
        />

        <label className="w-full p-3 bg-blue-600 text-white rounded-xl mb-3 cursor-pointer block text-center">
          {file ? file.name : "Seleccionar video"}
          <input
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer bg-gray-200 text-gray-800 hover:bg-gray-300`}
          >
            Cerrar
          </button>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`px-5 py-2 rounded-xl text-white transition-all flex items-center gap-2 cursor-pointer ${
              isUploading
                ? "bg-blue-300 cursor-not-allowed opacity-70"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUploading && "🔒"} Subir
          </button>
        </div>
      </div>
    </div>
  );
}
