"use client";

import { useState } from "react";
import { Video, FileText, Play, Calendar, Clock } from "lucide-react";

type Meeting = {
  id: string;
  title: string;
  date: string;
  duration: string;
  recording_url?: string;
  summary_pdf_url?: string;
  notes: string;
};

type Props = {
  meetings: Meeting[];
  projectId: string;
};

export default function MeetingsContent({ meetings, projectId }: Props) {
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
    <>
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
            {meetings.filter((m) => m.recording_url).length}
          </p>
          <p className="text-sm text-gray-600">Grabaciones</p>
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

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.map((meeting, index) => {
          const dateInfo = formatDate(meeting.date);
          return (
            <div
              key={meeting.id}
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
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

                <p className="text-gray-700 mb-4">{meeting.notes}</p>

                <div className="flex gap-3">
                  {meeting.recording_url && (
                    <a
                      href={meeting.recording_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Play className="w-4 h-4" />
                      Ver Grabación
                    </a>
                  )}
                  {meeting.summary_pdf_url && (
                    <a
                      href={meeting.summary_pdf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
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

      {/* Next Meeting Card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-lg font-bold mb-2">📅 Próxima Reunión</h3>
        <p className="text-blue-100 mb-4">
          Sprint Review #2 - Lunes 21 de octubre, 15:00hs
        </p>
        <a
          href="https://meet.google.com/abc-defg-hij"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-medium transition-colors"
        >
          <Video className="w-4 h-4" />
          Unirse a la reunión
        </a>
      </div>
    </>
  );
}
