"use client";

import { useState } from "react";
import { Client, Project, Video, Meeting } from "../page";
import { createClient } from "@/lib/supabase/client";

type ClientVideoDetailsModalProps = {
  show: boolean;
  client: Client | null;
  onClose: () => void;
};

export default function ShowVideoClientModal({
  show,
  client,
  onClose,
}: ClientVideoDetailsModalProps) {
  const [searchTitle, setSearchTitle] = useState("");
  const [onlyUserVideos, setOnlyUserVideos] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  if (!show || !client) return null;

  // 🔹 Obtener todos los videos del cliente, incluyendo proyectos y meetings
  const allVideos: Video[] = [
    ...(client.videos || []),
    ...(client.projects?.flatMap((p) => [
      ...(p.videos || []),
      ...(p.all_meetings?.flatMap((m) => m.videos || []) || []),
    ]) || []),
  ];

  // 🔹 Filtrado mejorado
  const videosToShow = allVideos.filter((v: Video) => {
    // Filtrado por título
    if (
      searchTitle &&
      !v.title.toLowerCase().includes(searchTitle.toLowerCase())
    ) {
      return false;
    }

    // Filtrado por proyecto / meeting
    if (selectedProjectId) {
      const projectMatch = v.project_id === selectedProjectId;
      const meetingMatch =
        v.meeting_id &&
        client.projects
          ?.find((p) => p.id === selectedProjectId)
          ?.all_meetings?.some((m) => m.meeting_id === v.meeting_id);

      if (!projectMatch && !meetingMatch) return false;
    }

    if (selectedMeetingId && v.meeting_id !== selectedMeetingId) {
      return false;
    }

    // Solo mostrar videos del usuario si no hay proyecto ni meeting seleccionado
    if (
      onlyUserVideos &&
      !selectedProjectId &&
      !selectedMeetingId &&
      v.user_id !== client.id
    ) {
      return false;
    }

    return true;
  });

  // Supabase client
  const supabase = createClient();

  const eliminarVideo = async (video: Video) => {
    try {
      // 1️⃣ Primero eliminar en Vimeo vía API Next
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

      // 2️⃣ Si Vimeo fue exitoso, eliminar en Supabase
      const { error } = await supabase
        .from("videos")
        .delete()
        .eq("id", video.id);

      if (error) {
        console.error("Error eliminando en Supabase:", error);
      } else {
        console.log("Video eliminado correctamente de Vimeo y DB");
        setSelectedVideo(null);
      }
    } catch (err) {
      console.error("Error eliminando video:", err);
    }
  };
  console.log(videosToShow);
  console.log(selectedVideo);
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-3xl p-6 w-full max-w-7xl min-h-[48rem] shadow-2xl border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Galería de Videos
          </h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="border rounded-lg p-2 w-full sm:w-64"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUserVideos}
              onChange={() => setOnlyUserVideos(!onlyUserVideos)}
            />
            Solo videos del usuario
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedMeetingId("");
            }}
            className="border rounded-lg p-2"
          >
            <option value="">Todos los proyectos</option>
            {client.projects?.map((p: Project) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
          {selectedProjectId && (
            <select
              value={selectedMeetingId}
              onChange={(e) => setSelectedMeetingId(e.target.value)}
              className="border rounded-lg p-2"
            >
              <option value="">Todos los meetings</option>
              {client.projects
                ?.find((p: Project) => p.id === selectedProjectId)
                ?.all_meetings?.map((m: Meeting) => (
                  <option key={m.meeting_id} value={m.meeting_id}>
                    {m.title}
                  </option>
                ))}
            </select>
          )}
        </div>

        {/* Galería */}
        {videosToShow.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {videosToShow.map((v: Video) => (
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
                  <p className="text-sm text-gray-600">
                    {v.user_id === client.id
                      ? "Usuario"
                      : v.project_id
                      ? "Proyecto"
                      : v.meeting_id
                      ? "Meeting"
                      : ""}
                  </p>
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

      {selectedVideo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[1500px] shadow-2xl border border-gray-200 flex flex-col md:flex-row gap-6 min-h-[750px]">
            {/* Izquierda: detalles con scroll */}
            <div
              className="w-full md:w-1/4 flex flex-col gap-4 overflow-y-auto pr-2"
              style={{ maxHeight: "90vh" }}
            >
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

              <div className="mt-auto">
                <button
                  onClick={() => eliminarVideo(selectedVideo)}
                  className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 w-full cursor-pointer"
                >
                  Eliminar Video
                </button>
              </div>
            </div>

            {/* Derecha: video grande */}
            <div
              className="w-full md:w-3/4 relative flex-shrink-0"
              style={{ minHeight: "400px" }}
            >
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
