import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { Meeting } from "../page";
import { useQueryClient } from "@tanstack/react-query";

type AssignVideoMeetingsModalProps = {
  show: boolean;
  all_meetings: Meeting[] | null | undefined;
  onClose: () => void;
  refetchProfiles: () => void;
};
type Video = {
  user_id?: string;
  vimeo_id: string;
  vimeo_url: string;
  title: string;
  descripcion: string;
  project_id?: string;
  meeting_id?: string;
  duration: string;
};
export default function AssignVideoMeetingModal({
  show,
  all_meetings,
  onClose,
  refetchProfiles,
}: AssignVideoMeetingsModalProps) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [selectedMeetingId, setSelectedMeetingId] = useState("");

  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const supabase = createClient();
  if (!show || !all_meetings) return null;

  // 📹 Subida del video a Vimeo + guardado en DB
  const handleUpload = async () => {
    if (!file) {
      setMessage("Seleccioná un archivo.");
      return;
    }

    if (!title) {
      setMessage("Escribe un titulo.");
      return;
    }
    if (!descripcion) {
      setMessage("Escribe una descripcion.");
      return;
    }
    if (!duration) {
      setMessage("Asigna una duracion en minutos.");
      return;
    }
    if (!selectedMeetingId) {
      setMessage("Debes seleccionar a quién pertenece el video.");
      return;
    }
    try {
      setIsUploading(true);
      setProgress(0);
      setMessage("Creando sesión de subida en Vimeo...");

      // 1️⃣ Crear sesión en tu API
      const sessionRes = await fetch("/api/create-vimeo-upload-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: descripcion,
          size: file.size,
        }),
      });

      const { upload_link, uri, error } = await sessionRes.json();
      if (error) throw new Error(error);
      if (!upload_link || !uri)
        throw new Error("No se pudo obtener upload_link de Vimeo");

      // 2️⃣ Subir el archivo directamente a Vimeo (con progreso)
      setMessage("Subiendo a Vimeo...");

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

      // 3️⃣ Guardar datos en Supabase
      const vimeoId = uri.split("/").pop();
      const vimeoUrl = `https://vimeo.com/${vimeoId}`;

      const videoData: Video = {
        vimeo_id: vimeoId,
        vimeo_url: vimeoUrl,
        meeting_id: selectedMeetingId,
        title,
        descripcion,
        duration,
      };
      if (!selectedMeetingId)
        throw new Error(
          "Debe seleccionar un destino (usuario, reunión o proyecto)."
        );

      const { error: dbError } = await supabase
        .from("videos")
        .insert([videoData]);

      if (dbError) throw dbError;

      setMessage("✅ Video subido y guardado correctamente.");

      // ✅ Invalidar queries para actualización automática
      await refetchProfiles();
      setIsUploading(false);
      setProgress(100);
      setFile(null);
      setTitle("");
      setDuration("");
      setDescripcion("");
      setSelectedMeetingId("");
      setTimeout(() => {
        setMessage("");
        setProgress(0);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err);
        setMessage(`❌ ${err.message}`);
      } else {
        console.error(err);
        setMessage("❌ Error desconocido");
      }
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md border border-gray-200">
        {/* Nueva sección para elegir destino del video */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold mb-3 text-gray-800">
            Subir video a reunion
          </h4>
          <select
            value={selectedMeetingId}
            onChange={(e) => setSelectedMeetingId(e.target.value)}
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
          >
            <option value="">— Seleccionar Reunión —</option>
            {all_meetings?.map((m: Meeting) => (
              <option key={m.meeting_id} value={m.meeting_id}>
                {m.title}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Título del video"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-3 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
        <input
          type="text"
          placeholder="Duracion en minutos"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full mb-3 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
        <textarea
          placeholder="Descripción (opcional)"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          className="w-full mb-3 border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-400 focus:outline-none transition"
        />
        <div className="mb-3">
          <label
            htmlFor="videoUpload"
            className="flex items-center justify-center w-full p-3 bg-blue-600 text-white font-medium rounded-xl cursor-pointer hover:bg-blue-700 transition"
          >
            {file ? `Archivo seleccionado: ${file.name}` : "Seleccionar video"}
          </label>
          <input
            id="videoUpload"
            type="file"
            accept="video/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </div>

        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-4 mb-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-400 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {message && <p className="text-sm text-gray-700 mb-3">{message}</p>}

        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-5 py-2 rounded-2xl font-medium transition bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>

          <button
            onClick={handleUpload}
            disabled={isUploading}
            className="px-5 py-2 rounded-2xl font-medium transition bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {isUploading ? "Subiendo..." : "Subir"}
          </button>
        </div>
      </div>
    </div>
  );
}
