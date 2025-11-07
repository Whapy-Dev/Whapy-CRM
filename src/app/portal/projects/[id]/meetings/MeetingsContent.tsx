"use client";

import { useState } from "react";
import { FileText, Play, Calendar, Video } from "lucide-react";
import SelectVideoModal from "./SelectVideoModal";

type VideoType = {
  id: string;
  user_id?: string | null;
  meeting_id?: string | null;
  project_id?: string | null;
  vimeo_id: string;
  vimeo_url: string;
  title: string;
  status: string;
  descripcion: string;
  duration?: string | null;
  created_at: string;
};

type Lead = { name: string };
type Profile = { nombre: string };

type Meeting = {
  meeting_id: string;
  project_id: string;
  lead_id: string;
  user_id: string;
  type_meeting: string;
  title: string;
  start_at: string;
  location: string;
  meet_url?: string;
  summary_md: string;
  summary_pdf_url: string;
  created_at: string;
  estado: string;
  leads?: Lead;
  profiles?: Profile;
  duration: string;
  videos?: VideoType[];
};

type Props = {
  meetings: Meeting[];
  projectId: string;
  videos: VideoType[];
};

export default function MeetingsContent({
  meetings,
  projectId,
  videos,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedVideo, setSelectedVideo] = useState<VideoType | null>(null);
  const [showFull, setShowFull] = useState(false);
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

  const meetingsWithDate = meetings.filter(
    (m) => m.start_at && new Date(m.start_at) > new Date()
  );

  const sortedMeetings = meetingsWithDate.sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  );

  const nextMeeting = sortedMeetings[0];

  const filteredMeetings =
    selectedCategory === "Reuniones" || selectedCategory === "Todos"
      ? meetings
      : [];

  const filteredVideos =
    selectedCategory === "Videos" || selectedCategory === "Todos" ? videos : [];

  // 🔹 Contenido combinado
  const combinedItems = [
    ...filteredMeetings.map((m) => ({ type: "meeting", data: m })),
    ...filteredVideos.map((v) => ({ type: "video", data: v })),
  ];

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{meetings.length}</p>
          <p className="text-sm text-gray-600">Total de Reuniones</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Video className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{videos.length}</p>
          <p className="text-sm text-gray-600">Videos del Proyecto</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {meetings.filter((m) => m.summary_pdf_url).length}
          </p>
          <p className="text-sm text-gray-600">Resúmenes</p>
        </div>
      </div>

      {/* Filtros */}
      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        {["Todos", "Reuniones", "Videos"].map((cat) => {
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
          } else if (cat === "Videos") {
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

      {/* 🔹 Grid combinado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {combinedItems.map((item, index) => {
          if (item.type === "meeting") {
            const meeting = item.data as Meeting;
            const dateInfo = formatDate(meeting.start_at);
            const videoToOpen = meeting.videos?.[0] || null;
            const embedUrl =
              meeting.videos && meeting.videos.length > 0
                ? meeting.videos[0].vimeo_url.replace(
                    "vimeo.com/",
                    "player.vimeo.com/video/"
                  )
                : null;

            return (
              <div
                key={`meeting-${meeting.meeting_id}`}
                onClick={() => {
                  if (videoToOpen) setSelectedVideo(videoToOpen);
                }}
                className="bg-white rounded-xl shadow hover:shadow-lg transition-all overflow-hidden group border-l-4 border-blue-500 relative cursor-pointer"
              >
                <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                  📅 Reunión #{index + 1}
                </div>

                <div className="relative w-full pb-[56.25%] bg-gray-200">
                  {embedUrl ? (
                    <iframe
                      src={`${embedUrl}?autoplay=0&muted=1&title=0&byline=0&portrait=0`}
                      className="absolute top-0 left-0 w-full h-full rounded-t-xl pointer-events-none"
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture"
                    ></iframe>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                      <Calendar className="w-12 h-12" />
                    </div>
                  )}
                  {embedUrl && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Play className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                    {meeting.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {dateInfo.full} • {dateInfo.time}
                  </p>

                  {meeting.summary_pdf_url && (
                    <a
                      href={meeting.summary_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 text-sm mt-2 hover:underline"
                    >
                      <FileText className="w-4 h-4" />
                      Ver resumen
                    </a>
                  )}
                </div>
              </div>
            );
          } else {
            const video = item.data as VideoType;
            const embedUrl = video.vimeo_url.replace(
              "vimeo.com/",
              "player.vimeo.com/video/"
            );
            const dateInfo = formatDate(video.created_at);

            return (
              <div
                key={`video-${video.id}`}
                onClick={() => setSelectedVideo(video)}
                className="cursor-pointer bg-white rounded-xl shadow hover:shadow-lg transition-all overflow-hidden group border-l-4 border-purple-500 relative"
              >
                <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow">
                  🎥 Video
                </div>

                <div className="relative w-full pb-[56.25%] bg-black">
                  <iframe
                    src={`${embedUrl}?autoplay=0&title=0&byline=0&portrait=0&muted=1`}
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
                  {video.descripcion ? (
                    <div className="text-sm text-gray-500 mt-1">
                      {video.descripcion.length > 50 ? (
                        <>
                          <p
                            className={`transition-all ${
                              showFull ? "line-clamp-none" : "line-clamp-2"
                            }`}
                          >
                            {showFull
                              ? video.descripcion
                              : video.descripcion.slice(0, 50) + "..."}
                          </p>
                          <button
                            onClick={() => setShowFull(!showFull)}
                            className="text-blue-600 hover:underline font-medium ml-1"
                          >
                            {showFull ? "Ver menos" : "Ver más"}
                          </button>
                        </>
                      ) : (
                        <p>{video.descripcion}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1 italic">
                      Sin descripción
                    </p>
                  )}
                </div>
              </div>
            );
          }
        })}
      </div>

      {/* Próxima reunión */}
      {nextMeeting ? (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white mt-6">
          <h3 className="text-lg font-bold mb-2">📅 Próxima Reunión</h3>
          <p className="text-blue-100 mb-4">
            {nextMeeting.title} -{" "}
            {new Date(nextMeeting.start_at).toLocaleString("es-AR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      ) : (
        <div className="mt-6 text-gray-700">
          No hay próximas reuniones programadas.
        </div>
      )}

      {/* 🔹 Modal de selección de video */}
      {selectedVideo && (
        <SelectVideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
}
