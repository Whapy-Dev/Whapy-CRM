"use client";

import { useState } from "react";
import { Search, Calendar, Video, Clock, MapPin, User } from "lucide-react";
import { useAllMeetings } from "@/hooks/admin/useAllMeetings";

export default function MeetingsPage() {
  const { data: dataAllMeetings = [] } = useAllMeetings();

  const [searchTerm, setSearchTerm] = useState("");

  const typeConfig = {
    lead: { color: "bg-blue-100 text-blue-800", label: "Lead" },
    proyecto: { color: "bg-purple-100 text-purple-800", label: "Proyecto" },
    seguimiento: { color: "bg-green-100 text-green-800", label: "Seguimiento" },
  };

  const statusConfig = {
    programada: { color: "bg-yellow-100 text-yellow-800", label: "Programada" },
    completada: { color: "bg-green-100 text-green-800", label: "Completada" },
    cancelada: { color: "bg-red-100 text-red-800", label: "Cancelada" },
  };

  const locationIcons = {
    meet: <Video className="w-4 h-4" />,
    zoom: <Video className="w-4 h-4" />,
    telefono: <Clock className="w-4 h-4" />,
    presencial: <MapPin className="w-4 h-4" />,
  };

  const filteredMeetings = dataAllMeetings.filter((meeting) => {
    const leadName = meeting.leads?.name?.toLowerCase() || "";
    const profileName = meeting.profiles?.nombre?.toLowerCase() || "";
    const title = meeting.title?.toLowerCase() || "";

    const term = searchTerm.toLowerCase();

    return (
      leadName.includes(term) ||
      profileName.includes(term) ||
      title.includes(term)
    );
  });

  const upcomingMeetings = filteredMeetings
    .filter(
      (m) =>
        m.estado === "programada" &&
        m.start_at &&
        new Date(m.start_at) > new Date()
    )
    .sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    );

  const pastMeetings = filteredMeetings
    .filter(
      (m) =>
        m.estado === "completada" ||
        m.estado === "cancelada" ||
        (m.start_at && new Date(m.start_at) < new Date())
    )
    .sort(
      (a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime()
    );

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString("es-AR", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      time: d.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reuniones</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tu calendario de reuniones con leads y clientes
        </p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Próximas</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {upcomingMeetings.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {pastMeetings.length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Esta Semana</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {upcomingMeetings.slice(0, 7).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones y búsqueda */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar reuniones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Próximas reuniones */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Próximas Reuniones
        </h2>
        <div className="space-y-3">
          {upcomingMeetings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No hay reuniones programadas
            </div>
          ) : (
            upcomingMeetings.map((meeting) => {
              const { date, time } = meeting.start_at
                ? formatDateTime(meeting.start_at)
                : { date: "-", time: "-" };

              return (
                <div
                  key={meeting.meeting_id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            typeConfig[
                              meeting.type.toLowerCase() as keyof typeof typeConfig
                            ]?.color || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {typeConfig[
                            meeting.type.toLowerCase() as keyof typeof typeConfig
                          ]?.label || "Sin tipo"}
                        </span>

                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            statusConfig[
                              meeting.estado as keyof typeof statusConfig
                            ]?.color || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {statusConfig[
                            meeting.estado as keyof typeof statusConfig
                          ]?.label || "Sin estado"}
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {meeting.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {meeting.leads?.name || meeting.profiles?.nombre}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {date}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {time}
                        </div>
                        <div className="flex items-center gap-1">
                          {
                            locationIcons[
                              meeting.location as keyof typeof locationIcons
                            ]
                          }
                          {meeting.location}
                        </div>
                      </div>
                      {meeting.meet_url && (
                        <a
                          href={meeting.meet_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          <Video className="w-4 h-4" />
                          Unirse a la reunión
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reuniones pasadas */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Reuniones Pasadas
        </h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reunión
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicación
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pastMeetings.map((meeting) => {
                const { date, time } = meeting.start_at
                  ? formatDateTime(meeting.start_at)
                  : { date: "-", time: "-" };

                return (
                  <tr key={meeting.meeting_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {meeting.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {meeting.leads?.name || meeting.profiles?.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          typeConfig[
                            meeting.type.toLowerCase() as keyof typeof typeConfig
                          ]?.color || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {typeConfig[
                          meeting.type.toLowerCase() as keyof typeof typeConfig
                        ]?.label || "Sin tipo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>{date}</div>
                      <div className="text-xs text-gray-500">{time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {
                          locationIcons[
                            meeting.location as keyof typeof locationIcons
                          ]
                        }
                        {meeting.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusConfig[
                            meeting.estado as keyof typeof statusConfig
                          ]?.color || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {statusConfig[
                          meeting.estado as keyof typeof statusConfig
                        ]?.label || "Sin estado"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {pastMeetings.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay reuniones completadas
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
