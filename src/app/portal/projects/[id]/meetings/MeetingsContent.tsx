"use client";

import { useState } from "react";
import { FileText, Play, Calendar, Video } from "lucide-react";
import SelectVideoModal from "./SelectVideoModal";

type VideoType = {
  id: string;
  user_id?: string | null;
  project_id?: string | null;
  vimeo_id: string;
  vimeo_url: string;
  title: string;
  status: string;
  descripcion: string;
  duration?: string | null;
  created_at: string;
  type_video: string;
};

type Props = {
  projectId: string;
  videos: VideoType[];
};

export default function MeetingsContent({ projectId, videos }: Props) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);

  const timeAgo = (dateString: string) => {
    const now = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now.getTime() - past.getTime()) / 1000);

    const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(diff / 3600);
    const days = Math.floor(diff / 86400);
    const weeks = Math.floor(diff / 604800);
    const months = Math.floor(diff / 2592000);
    const years = Math.floor(diff / 31536000);

    if (years > 0) return rtf.format(-years, "year");
    if (months > 0) return rtf.format(-months, "month");
    if (weeks > 0) return rtf.format(-weeks, "week");
    if (days > 0) return rtf.format(-days, "day");
    if (hours > 0) return rtf.format(-hours, "hour");
    if (minutes > 0) return rtf.format(-minutes, "minute");
    return "hace unos segundos";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  // 🔥 SOLO FILTRO VIDEOS YA QUE NO HAY REUNIONES
  const filteredVideos =
    selectedCategory === "Todos"
      ? videos
      : videos.filter((v) =>
          selectedCategory === "Videos Informativos"
            ? v.type_video === "Video informativo"
            : v.type_video === "Reunion"
        );

  const noItemsMessage =
    filteredVideos.length === 0
      ? "No hay videos para mostrar en esta categoría."
      : null;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Reuniones */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {videos.filter((v) => v.type_video === "Reunion").length}
          </p>
          <p className="text-sm text-gray-600">Videos de Reuniones</p>
        </div>

        {/* Videos Informativos */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {videos.filter((v) => v.type_video === "Video informativo").length}
          </p>
          <p className="text-sm text-gray-600">Videos Informativos</p>
        </div>

        {/* Total */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
          <p className="text-sm text-gray-600">Total de Videos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        {["Todos", "Reuniones", "Videos Informativos"].map((cat) => {
          const isActive = selectedCategory === cat;
          let activeClasses = "";

          if (cat === "Todos") {
            activeClasses = isActive
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100";
          } else if (cat === "Reuniones") {
            activeClasses = isActive
              ? "bg-blue-100 text-blue-700 border-blue-300"
              : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50";
          } else if (cat === "Videos Informativos") {
            activeClasses = isActive
              ? "bg-purple-100 text-purple-700 border-purple-300"
              : "bg-white text-gray-700 border-gray-300 hover:bg-purple-50";
          }

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition cursor-pointer ${activeClasses}`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Si no hay elementos */}
      {noItemsMessage ? (
        <div className="text-center text-gray-500 py-10 text-sm font-medium">
          {noItemsMessage}
        </div>
      ) : (
        <div
          className="
            flex overflow-x-auto gap-6 pb-4 
            md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-visible
            snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
          "
        >
          {filteredVideos.map((video, index) => {
            const embedUrl = video.vimeo_url.replace(
              "vimeo.com/",
              "player.vimeo.com/video/"
            );

            const dateInfo = formatDate(video.created_at);
            const isMeeting = video.type_video === "Reunion";
            const borderColor = isMeeting
              ? "border-blue-500"
              : "border-purple-500";

            return (
              <div
                key={`video-${video.id}`} // 🔥 KEY ÚNICA Y CORRECTA
                onClick={() => setSelectedVideo(video)}
                className={`bg-white rounded-xl shadow hover:shadow-lg transition-all overflow-hidden group border-l-4 ${borderColor} relative cursor-pointer flex-shrink-0 w-80 md:w-auto snap-center`}
              >
                <div
                  className={`absolute top-3 left-3 ${
                    isMeeting ? "bg-blue-600" : "bg-purple-600"
                  } text-white text-xs font-semibold px-2 py-1 rounded-md shadow`}
                >
                  {isMeeting ? "📅 Reunión" : "🎥 Video Informativo"}
                </div>

                <div className="relative w-full pb-[56.25%] bg-gray-200">
                  <iframe
                    src={`${embedUrl}?autoplay=0&muted=1&title=0&byline=0&portrait=0`}
                    className="absolute top-0 left-0 w-full h-full rounded-t-xl pointer-events-none"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                  ></iframe>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Play className="w-12 h-12 text-white drop-shadow-lg" />
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {video.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {dateInfo.full} • {dateInfo.time}
                  </p>
                  <p className="text-xs text-gray-400 mt-1 italic">
                    {timeAgo(video.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedVideo && (
        <SelectVideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}
