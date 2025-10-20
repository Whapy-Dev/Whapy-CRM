'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Video, FileText, Download, Play, Calendar, Clock } from 'lucide-react';

type Meeting = {
  id: string;
  title: string;
  date: string;
  duration: string;
  recording_url?: string;
  summary_pdf_url?: string;
  notes: string;
};

export default function ProjectMeetingsPage({ params }: { params: { id: string } }) {
  const [meetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Kickoff - Inicio del Proyecto',
      date: '2025-09-15T10:00:00Z',
      duration: '1h 30min',
      recording_url: 'https://drive.google.com/file/d/example123',
      summary_pdf_url: '/documents/meeting-1-summary.pdf',
      notes: 'Definimos los objetivos principales del proyecto, alcance y cronograma inicial. Se acordó la metodología de trabajo y los entregables principales.'
    },
    {
      id: '2',
      title: 'Revisión de Wireframes',
      date: '2025-09-22T15:00:00Z',
      duration: '45min',
      recording_url: 'https://drive.google.com/file/d/example456',
      summary_pdf_url: '/documents/meeting-2-summary.pdf',
      notes: 'Presentación y validación de wireframes iniciales. Se realizaron ajustes en la navegación principal y la estructura de las secciones.'
    },
    {
      id: '3',
      title: 'Sprint Review #1',
      date: '2025-10-01T11:00:00Z',
      duration: '1h',
      recording_url: 'https://drive.google.com/file/d/example789',
      summary_pdf_url: '/documents/meeting-3-summary.pdf',
      notes: 'Demostración del progreso del primer sprint. Se validaron las funcionalidades del home y el sistema de navegación.'
    },
    {
      id: '4',
      title: 'Revisión de Diseño UI',
      date: '2025-10-08T14:00:00Z',
      duration: '1h 15min',
      recording_url: 'https://drive.google.com/file/d/example101',
      summary_pdf_url: '/documents/meeting-4-summary.pdf',
      notes: 'Aprobación final del diseño visual. Se definieron paleta de colores, tipografías y componentes principales de la UI.'
    }
  ]);

  const projectName = 'Desarrollo Web Corporativo';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })
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
        <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
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
            {meetings.filter(m => m.recording_url).length}
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
            {meetings.filter(m => m.summary_pdf_url).length}
          </p>
          <p className="text-sm text-gray-600">Resúmenes PDF</p>
        </div>
      </div>

      {/* Meetings Timeline */}
      <div className="space-y-4">
        {meetings.map((meeting, index) => {
          const { full, time } = formatDate(meeting.date);
          return (
            <div key={meeting.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              {/* Meeting Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                        {index + 1}
                      </span>
                      <h2 className="text-xl font-bold text-gray-900">{meeting.title}</h2>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="capitalize">{full}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {time} • {meeting.duration}
                      </div>
                    </div>
                    <p className="text-gray-700">{meeting.notes}</p>
                  </div>
                </div>
              </div>

              {/* Meeting Resources */}
              <div className="p-6 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Recursos Disponibles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Recording */}
                  {meeting.recording_url ? (
                    <a
                      href={meeting.recording_url}
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
                        <p className="text-sm text-gray-500">Video en Google Drive</p>
                      </div>
                      <Video className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gray-100 border border-gray-200 rounded-lg opacity-50">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <Play className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-500">Grabación no disponible</h4>
                        <p className="text-sm text-gray-400">Esta reunión no fue grabada</p>
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
                          Descargar Resumen
                        </h4>
                        <p className="text-sm text-gray-500">Archivo PDF</p>
                      </div>
                      <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-gray-100 border border-gray-200 rounded-lg opacity-50">
                      <div className="p-2 bg-gray-200 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-500">Resumen no disponible</h4>
                        <p className="text-sm text-gray-400">Será agregado próximamente</p>
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