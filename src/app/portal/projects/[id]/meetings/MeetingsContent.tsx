"use client";

import { useState } from "react";
import { FileText, Play, Calendar, Clock, Video } from "lucide-react";

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

type Lead = {
  name: string;
};

type Profile = {
  nombre: string;
};

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
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Todos");

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

  // 🔹 Filtrado según categoría seleccionada
  const filteredMeetings =
    selectedCategory === "Reuniones" || selectedCategory === "Todos"
      ? meetings
      : [];

  const filteredVideos =
    selectedCategory === "Videos" || selectedCategory === "Todos" ? videos : [];

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
          <p className="text-2xl font-bold text-gray-900">{meetings?.length}</p>
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

      {/* 🔹 Filtros */}
      <div className="flex gap-3 mb-6">
        {["Todos", "Reuniones", "Videos"].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition cursor-pointer ${
              selectedCategory === cat
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🔹 Mostrar Reuniones */}
      {(selectedCategory === "Reuniones" || selectedCategory === "Todos") && (
        <div className="space-y-4">
          {filteredMeetings.map((meeting, index) => {
            const dateInfo = formatDate(meeting.start_at);
            const embedUrl =
              meeting.videos && meeting.videos.length > 0
                ? meeting.videos[0].vimeo_url.replace(
                    "vimeo.com/",
                    "player.vimeo.com/video/"
                  )
                : null;

            return (
              <div
                key={meeting.meeting_id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                          Reunión #{index + 1}
                        </span>
                        <span className="text-sm text-gray-500">
                          {meeting.duration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="capitalize">{dateInfo.full}</span>
                          <span className="mx-2">•</span>
                          <Clock className="w-4 h-4" />
                          <span>{dateInfo.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {embedUrl && (
                      <div className="relative w-full pb-[56.25%]">
                        <iframe
                          src={embedUrl}
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    <p className="text-gray-700 mb-4 whitespace-pre-wrap break-words">
                      {expanded
                        ? meeting.summary_md
                        : meeting.summary_md.slice(0, 300) +
                          (meeting.summary_md.length > 300 ? "..." : "")}
                    </p>
                    {meeting.summary_md.length > 300 && (
                      <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        {expanded ? "Ver menos" : "Ver más"}
                      </button>
                    )}

                    {meeting.summary_pdf_url && (
                      <a
                        href={meeting.summary_pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex justify-center items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Descargar Resumen
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔹 Mostrar Videos */}
      {(selectedCategory === "Videos" || selectedCategory === "Todos") && (
        <div className="space-y-4 mt-8">
          {filteredVideos.map((video) => {
            const embedUrl = video.vimeo_url.replace(
              "vimeo.com/",
              "player.vimeo.com/video/"
            );
            return (
              <div
                key={video.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  🎥 {video.title}
                </h3>
                <div className="relative w-full pb-[56.25%] mb-3">
                  <iframe
                    src={embedUrl}
                    className="absolute top-0 left-0 w-full h-full rounded-lg"
                    frameBorder="0"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {video.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔹 Próxima reunión */}
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
    </>
  );
}
