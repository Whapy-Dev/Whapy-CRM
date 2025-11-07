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

  const handleClose = useCallback(() => {
    setShow(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    if (!video) return;

    setShow(true);
    const handleKeyDown = (e: KeyboardEvent) =>
      e.key === "Escape" && handleClose();
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
        } 
          md:max-h-[90vh] md:flex md:flex-col 
          max-md:w-full max-md:h-full max-md:rounded-none max-md:flex max-md:flex-col
        `}
      >
        {/* Botón cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-20 bg-black/60 text-white p-2 rounded-full md:bg-gray-100 md:text-gray-700 hover:opacity-80"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video */}
        <div className="relative w-full bg-black aspect-video flex-shrink-0">
          <iframe
            src={`${embedUrl}?autoplay=1&title=0&byline=0&portrait=0`}
            allow="autoplay; fullscreen; picture-in-picture"
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
          ></iframe>
        </div>

        {/* Contenido scrollable */}
        <div className="flex flex-col flex-grow overflow-y-auto p-5 md:max-h-[calc(90vh-56px)]">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {video.title}
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Subido el{" "}
            {new Date(video.created_at).toLocaleDateString("es-AR", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          {/* 🔹 La descripción ahora scrollea si es muy larga */}
          <div className="text-gray-700 leading-relaxed whitespace-pre-line overflow-y-auto flex-grow">
            {video.descripcion || "Sin descripción"}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
