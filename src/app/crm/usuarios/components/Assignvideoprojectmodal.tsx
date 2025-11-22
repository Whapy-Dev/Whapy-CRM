import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Project } from "../page";

type AssignVideoModalProps = {
  show: boolean;
  project: Project | null;
  onClose: () => void;
  refetchProfile: () => void;
};

type Video = {
  vimeo_id: string;
  vimeo_url: string;
  title: string;
  descripcion: string;
  duration: string;
  project_id?: string;
  type_video: string;
};

// 🔐 Respuesta tipada del endpoint de Vimeo
type VimeoSessionResponse = {
  upload_link: string;
  uri: string;
  error?: string;
};

export default function AssignVideoModal({
  show,
  project,
  onClose,
  refetchProfile,
}: AssignVideoModalProps) {
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [uploadType, setUploadType] = useState<"project" | "meeting" | "">("");

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setFile(null);
    setTitle("");
    setDuration("");
    setDescripcion("");
    setUploadType("");
    setProgress(0);
    setMessage("");
  };
  if (!show || !project) return null;
  const handleUpload = async () => {
    if (!uploadType) return setMessage("Selecciona el tipo de video.");
    if (!file) return setMessage("Seleccioná un archivo.");
    if (!title) return setMessage("Escribe un título.");
    if (!descripcion) return setMessage("Escribe una descripción.");
    if (!duration) return setMessage("Asigna una duración.");

    try {
      setIsUploading(true);
      setProgress(0);
      setMessage("Creando sesión de subida en Vimeo...");

      // Crear sesión Vimeo
      const sessionRes = await fetch("/api/create-vimeo-upload-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: descripcion,
          size: file.size,
        }),
      });

      const sessionJson: VimeoSessionResponse = await sessionRes.json();
      if (sessionJson.error) throw new Error(sessionJson.error);

      const { upload_link, uri } = sessionJson;
      if (!upload_link || !uri) throw new Error("Respuesta inválida de Vimeo.");

      // Subir video a Vimeo
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PATCH", upload_link, true);
        xhr.setRequestHeader("Tus-Resumable", "1.0.0");
        xhr.setRequestHeader("Upload-Offset", "0");
        xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(percent);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Error Vimeo: ${xhr.statusText}`));
        };

        xhr.onerror = () => reject(new Error("Error de conexión con Vimeo"));
        xhr.send(file);
      });

      // Guardar en DB
      const vimeoId = uri.split("/").pop() ?? "";
      const vimeoUrl = `https://vimeo.com/${vimeoId}`;

      const videoData = {
        vimeo_id: vimeoId,
        vimeo_url: vimeoUrl,
        title,
        descripcion,
        duration,
        project_id: project.id,
        type_video: uploadType === "project" ? "Video informativo" : "Reunion",
      };

      const { error: dbError } = await supabase
        .from("videos")
        .insert([videoData]);

      if (dbError) throw dbError;

      setMessage("✅ Video subido correctamente.");
      await refetchProfile();

      setTimeout(() => {
        resetForm();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setMessage("❌ " + errorMessage);
    } finally {
      setIsUploading(false);
    }
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

        <input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 border p-3 rounded-xl"
        />

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

        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
            <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {message && <p className="text-gray-700 mb-3">{message}</p>}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isUploading}
            className={`px-5 py-2 rounded-xl transition-all flex items-center gap-2 ${
              isUploading
                ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-70"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {isUploading && "🔒"} Cancelar
          </button>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className={`px-5 py-2 rounded-xl text-white transition-all flex items-center gap-2 ${
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
