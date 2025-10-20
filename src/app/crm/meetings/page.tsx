'use client';

import { useState } from 'react';
import { Plus, Search, Calendar, Video, Clock, MapPin, User } from 'lucide-react';

type Meeting = {
  id: string;
  type: 'lead' | 'presupuesto' | 'seguimiento';
  lead_name: string;
  title: string;
  start_at: string;
  end_at: string;
  location: 'meet' | 'zoom' | 'teléfono' | 'presencial';
  meet_url?: string;
  status: 'programada' | 'completada' | 'cancelada';
};

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      type: 'lead',
      lead_name: 'Juan Pérez',
      title: 'Primera reunión - Descubrimiento',
      start_at: '2025-10-20T10:00:00Z',
      end_at: '2025-10-20T11:00:00Z',
      location: 'meet',
      meet_url: 'https://meet.google.com/abc-defg-hij',
      status: 'programada'
    },
    {
      id: '2',
      type: 'presupuesto',
      lead_name: 'María González',
      title: 'Presentación de Presupuesto',
      start_at: '2025-10-21T15:00:00Z',
      end_at: '2025-10-21T16:00:00Z',
      location: 'zoom',
      meet_url: 'https://zoom.us/j/123456789',
      status: 'programada'
    },
    {
      id: '3',
      type: 'seguimiento',
      lead_name: 'Carlos Rodríguez',
      title: 'Seguimiento - Dudas sobre presupuesto',
      start_at: '2025-10-18T14:00:00Z',
      end_at: '2025-10-18T14:30:00Z',
      location: 'teléfono',
      status: 'completada'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'lista' | 'calendario'>('lista');

  const typeConfig = {
    lead: { color: 'bg-blue-100 text-blue-800', label: 'Lead' },
    presupuesto: { color: 'bg-purple-100 text-purple-800', label: 'Presupuesto' },
    seguimiento: { color: 'bg-green-100 text-green-800', label: 'Seguimiento' }
  };

  const statusConfig = {
    programada: { color: 'bg-yellow-100 text-yellow-800', label: 'Programada' },
    completada: { color: 'bg-green-100 text-green-800', label: 'Completada' },
    cancelada: { color: 'bg-red-100 text-red-800', label: 'Cancelada' }
  };

  const locationIcons = {
    meet: <Video className="w-4 h-4" />,
    zoom: <Video className="w-4 h-4" />,
    teléfono: <Clock className="w-4 h-4" />,
    presencial: <MapPin className="w-4 h-4" />
  };

  const filteredMeetings = meetings.filter(meeting =>
    meeting.lead_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const upcomingMeetings = filteredMeetings
    .filter(m => m.status === 'programada' && new Date(m.start_at) > new Date())
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

  const pastMeetings = filteredMeetings
    .filter(m => m.status === 'completada' || new Date(m.start_at) < new Date())
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

  const formatDateTime = (date: string) => {
    const d = new Date(date);
    return {
      date: d.toLocaleDateString('es-AR', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: d.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
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

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Agendar Reunión
          </button>
        </div>
      </div>

      {/* Próximas reuniones */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Próximas Reuniones</h2>
        <div className="space-y-3">
          {upcomingMeetings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              No hay reuniones programadas
            </div>
          ) : (
            upcomingMeetings.map((meeting) => {
              const { date, time } = formatDateTime(meeting.start_at);
              return (
                <div key={meeting.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeConfig[meeting.type].color}`}>
                          {typeConfig[meeting.type].label}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[meeting.status].color}`}>
                          {statusConfig[meeting.status].label}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {meeting.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {meeting.lead_name}
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
                          {locationIcons[meeting.location]}
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Reuniones Completadas</h2>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pastMeetings.map((meeting) => {
                const { date, time } = formatDateTime(meeting.start_at);
                return (
                  <tr key={meeting.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{meeting.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {meeting.lead_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeConfig[meeting.type].color}`}>
                        {typeConfig[meeting.type].label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div>{date}</div>
                      <div className="text-xs text-gray-500">{time}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {locationIcons[meeting.location]}
                        {meeting.location}
                      </div>
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