"use client";
import { createContext, useContext, useState } from "react";

type UploadContextType = {
  isUploading: boolean;
  progress: number;
  message: string;
  startUpload: (
    file: File,
    data: UploadData,
    onFinish?: () => void
  ) => Promise<boolean>;
};
type UploadData = {
  title: string;
  descripcion: string;
  duration: string;
  project_id: string;
  type_video: string;
};

const UploadContext = createContext<UploadContextType | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");

  async function startUpload(
    file: File,
    data: UploadData,
    onFinish?: () => void
  ): Promise<boolean> {
    setIsUploading(true);
    setProgress(0);
    setMessage("Creando sesión en Vimeo...");

    try {
      // 1) Crear sesión
      const sessionRes = await fetch("/api/create-vimeo-upload-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.title,
          description: data.descripcion,
          size: file.size,
        }),
      });

      const sessionJson = await sessionRes.json();
      const { upload_link, uri } = sessionJson;

      // 2) Subir usando XHR pero sin bloquear UI
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PATCH", upload_link, true);
        xhr.setRequestHeader("Tus-Resumable", "1.0.0");
        xhr.setRequestHeader("Upload-Offset", "0");
        xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };

        xhr.onload = () => (xhr.status < 300 ? resolve() : reject());
        xhr.onerror = () => reject();

        xhr.send(file);
      });

      // 3) Guardar en Supabase
      const vimeoId = uri.split("/").pop();
      const vimeoUrl = `https://vimeo.com/${vimeoId}`;

      const dbRes = await fetch("/api/save-video-to-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          vimeo_id: vimeoId,
          vimeo_url: vimeoUrl,
        }),
      });

      if (!dbRes.ok) {
        const errText = await dbRes.text();
        throw new Error("Error al guardar en Supabase: " + errText);
      }
      if (onFinish) onFinish();

      setProgress(100);
      setMessage("¡Subida completada!");
      setTimeout(() => {
        setProgress(0);
        setMessage("");
      }, 500);
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setMessage("❌ " + errorMessage);
      return false;
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <UploadContext.Provider
      value={{ isUploading, progress, message, startUpload }}
    >
      {children}
    </UploadContext.Provider>
  );
}

export function useUpload() {
  const context = useContext(UploadContext);
  if (!context) {
    throw new Error("useUpload must be used inside UploadProvider");
  }
  return context;
}
