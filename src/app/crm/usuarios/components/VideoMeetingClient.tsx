"use client";

import { useState } from "react";
import { Project, Video } from "../page";
import { createClient } from "@/lib/supabase/client";

type ClientVideoDetailsMeetingModalProps = {
  show: boolean;
  project: Project | null;
  onClose: () => void;
  refetchProfile: () => void;
};

const supabase = createClient();

export default function ShowVideoMeetingClientModal({
  show,
  project,
  onClose,
  refetchProfile,
}: ClientVideoDetailsMeetingModalProps) {
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  if (!show || !project) return null;
  // 📹 Obtener todos los videos de los meetings del proyecto
  // 📹 Obtener solo videos de tipo "Reunion" del proyecto
  const allVideos: Video[] =
    project.videos?.filter((v) => v.type_video === "Reunion") || [];

  // 📹 Filtrar solo por título
  const videosToShow = allVideos.filter((v) =>
    v.title.toLowerCase().includes(searchTitle.toLowerCase())
  );
  const eliminarVideo = async (video: Video) => {
    try {
      const res = await fetch("/api/delete-video-vimeo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.vimeo_id }),
      });

      const data = await res.json();
      if (!data.ok) {
        console.error("Error eliminando en Vimeo:", data.error);
        return;
      }

      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", video.id);

      if (error) {
        console.error("Error en Supabase:", error);
      } else {
        // ✅ Invalidar queries para actualización automática
        await refetchProfile();
        setSelectedVideo(null);
      }
    } catch (err) {
      console.error("Error eliminando video:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-3xl p-6 w-full max-w-7xl min-h-[48rem] shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Videos de Meetings
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        {/* Filtro por título */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="border rounded-lg p-2 w-full max-w-sm"
          />
        </div>

        {/* Galería de videos */}
        {videosToShow.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {videosToShow.map((v) => (
              <div
                key={v.id}
                className="bg-gray-50 rounded-xl hover:shadow-md hover:scale-105 overflow-hidden border-0 transition-all duration-300"
              >
                <div className="relative pb-[56.25%]">
                  <iframe
                    src={`https://player.vimeo.com/video/${v.vimeo_id}`}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => setSelectedVideo(v)}
                >
                  <h4 className="font-semibold text-gray-800 mb-1">
                    {v.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-6">
            No se encontraron videos
          </p>
        )}
      </div>

      {/* Modal de video seleccionado */}
      {selectedVideo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[1500px] shadow-2xl border border-gray-200 flex flex-col md:flex-row gap-6 min-h-[750px]">
            {/* Izquierda: detalles */}
            <div className="w-full md:w-1/4 flex flex-col gap-4 overflow-y-auto pr-2">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{selectedVideo.title}</h3>
                  <button
                    onClick={() => setSelectedVideo(null)}
                    className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 font-medium cursor-pointer"
                  >
                    Cerrar
                  </button>
                </div>
                <p className="mb-2">
                  <strong>Descripción:</strong>{" "}
                  {selectedVideo.descripcion || "Sin descripción"}
                </p>
                <p className="mb-2">
                  <strong>Status:</strong> {selectedVideo.status}
                </p>
                <p className="mb-2">
                  <strong>Duración:</strong>{" "}
                  {selectedVideo.duration || "No disponible"}
                </p>
              </div>

              <button
                onClick={() => eliminarVideo(selectedVideo)}
                className="mt-auto px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 w-full cursor-pointer"
              >
                Eliminar Video
              </button>
            </div>

            {/* Derecha: video grande */}
            <div className="w-full md:w-3/4 relative flex-shrink-0">
              <iframe
                src={`https://player.vimeo.com/video/${selectedVideo.vimeo_id}`}
                className="absolute top-0 left-0 w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
