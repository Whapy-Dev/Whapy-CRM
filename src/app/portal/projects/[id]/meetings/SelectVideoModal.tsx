"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

type VideoType = {
  id: string;
  vimeo_id: string;
  vimeo_url: string;
  title: string;
  descripcion?: string;
  duration?: string | null;
  created_at: string;
};

type SelectVideoModalProps = {
  video: VideoType | null;
  onClose: () => void;
};

export default function SelectVideoModal({
  video,
  onClose,
}: SelectVideoModalProps) {
  const [show, setShow] = useState(false);

  // 🔹 Callback estable para evitar warnings
  const handleClose = useCallback(() => {
    setShow(false);
    setTimeout(onClose, 200); // Espera la animación
  }, [onClose]);

  // 🔹 Manejo de apertura/cierre + teclado + scroll lock
  useEffect(() => {
    if (!video) return;

    setShow(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [video, handleClose]);

  if (!video) return null;

  const embedUrl = video.vimeo_url.replace(
    "vimeo.com/",
    "player.vimeo.com/video/"
  );

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-200 ${
        show ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white rounded-xl shadow-2xl w-[90%] max-w-5xl overflow-hidden relative transform transition-all duration-200 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        style={{
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/90 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {video.title}
            </h2>
            <p className="text-sm text-gray-500">
              {video.descripcion || "Sin descripción"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Video */}
        <div className="relative w-full bg-black aspect-video flex-grow">
          <iframe
            src={`${embedUrl}?autoplay=1&title=0&byline=0&portrait=0`}
            allow="autoplay; fullscreen; picture-in-picture"
            className="absolute top-0 left-0 w-full h-full rounded-b-xl"
            frameBorder="0"
          ></iframe>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-3 border-t border-gray-200 bg-gray-50 text-sm text-gray-500">
          <span>
            Subido el{" "}
            {new Date(video.created_at).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
          {video.duration && (
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
              ⏱ {video.duration}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
