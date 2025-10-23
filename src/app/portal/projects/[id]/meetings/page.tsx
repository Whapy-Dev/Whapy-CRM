"use client";

import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Video,
  FileText,
  Download,
  Play,
  Calendar,
} from "lucide-react";

import { useMeetingsByProjectUser } from "@/hooks/user/useMeetings";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Meeting = {
  id: string;
  title: string;
  date: string;
  duration: string;
  recording_url?: string;
  summary_pdf_url?: string;
  notes: string;
};

export default function ProjectMeetingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const { data: meetings = [] } = useMeetingsByProjectUser(projectId);

  const projectName = meetings[0]?.projects?.title || "Proyecto";

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

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/portal/projects"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Proyectos
      </Link>

      {/* Header */}
      <div>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
          <a
            href=""
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Crear nueva reunión
          </a>
        </div>
        <p className="mt-2 text-gray-600">
          Reuniones y grabaciones del proyecto
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <p className="text-2xl font-bold text-gray-900">
            {meetings.filter((m) => m.meet_url).length}
          </p>
          <p className="text-sm text-gray-600">Grabaciones Disponibles</p>
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
          <p className="text-sm text-gray-600">Resúmenes PDF</p>
        </div>
      </div>

      {/* Meetings Timeline */}
      <div className="space-y-4">
        {meetings.map((meeting, index) => {
          const { full } = formatDate(meeting.start_at);
          return (
            <div
              key={meeting.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
            >
              {/* Meeting Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                        {index + 1}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900">
                        {meeting.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">{full}</span>
                      </div>
                    </div>
                    <p className="text-gray-700">{meeting.summary_md}</p>
                  </div>
                </div>
              </div>

              {/* Meeting Resources */}
              <div className="p-6 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Recursos Disponibles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Recording */}
                  {meeting.meet_url ? (
                    <a
                      href={meeting.meet_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-sm transition-all group"
                    >
                      <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Play className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                          Ver Grabación
                        </h4>
                        <p className="text-sm text-gray-500">
                          Video en Google Drive
                        </p>
                      </div>
                      <Video className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gray-100 border border-gray-200 rounded-lg opacity-50">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <Play className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-500">
                          Grabación no disponible
                        </h4>
                        <p className="text-sm text-gray-400">
                          Esta reunión no fue grabada
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Summary PDF */}
                  {meeting.summary_pdf_url ? (
                    <a
                      href={meeting.summary_pdf_url}
                      download
                      className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group"
                    >
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          Descargar PDF
                        </h4>
                      </div>
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gray-100 border border-gray-200 rounded-lg opacity-50">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-500">
                          Resumen no disponible
                        </h4>
                        <p className="text-sm text-gray-400">
                          Será agregado próximamente
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {meetings.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay reuniones registradas
          </h3>
          <p className="text-gray-600">
            Las reuniones aparecerán aquí una vez que sean agendadas
          </p>
        </div>
      )}
    </div>
  );
}
