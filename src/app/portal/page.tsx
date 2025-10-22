"use client";

import Link from "next/link";
import {
  Calendar,
  FileText,
  Download,
  CheckCircle,
  ArrowRight,
  FolderOpen,
  User,
  Video,
} from "lucide-react";

export default function PortalDashboard() {
  const clientData = {
    name: "Juan",
    company: "Tech Solutions",
    activeProjects: 2,
    nextMeeting: {
      title: "Sprint Review #2",
      date: "2025-10-21T15:00:00Z",
      project: "Desarrollo Web Corporativo",
      meet_url: "https://meet.google.com/abc-defg-hij",
    },
    recentActivity: [
      {
        id: "1",
        type: "document",
        title: "Nuevo resumen de reunión disponible",
        project: "Desarrollo Web Corporativo",
        date: "2025-10-18",
        url: "#",
      },
      {
        id: "2",
        type: "design",
        title: "Diseño actualizado a v2.0",
        project: "Desarrollo Web Corporativo",
        date: "2025-10-15",
        url: "/portal/projects/1/design",
      },
      {
        id: "3",
        type: "meeting",
        title: "Reunión completada: Revisión de Wireframes",
        project: "App Mobile Inventario",
        date: "2025-10-14",
        url: "/portal/projects/2/meetings",
      },
    ],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("es-AR", {
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

  const nextMeeting = formatDate(clientData.nextMeeting.date);

  const activityIcons = {
    document: <FileText className="w-5 h-5 text-blue-600" />,
    design: <FolderOpen className="w-5 h-5 text-purple-600" />,
    meeting: <Video className="w-5 h-5 text-green-600" />,
  };

  const activityBgColors = {
    document: "bg-blue-100",
    design: "bg-purple-100",
    meeting: "bg-green-100",
  };

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          ¡Hola, {clientData.name}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Bienvenido a tu portal personalizado de Whapy LLC
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/portal/projects"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Proyectos Activos
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {clientData.activeProjects}
          </p>
          <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
            Ver proyectos <ArrowRight className="w-4 h-4" />
          </p>
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Estado General
          </h3>
          <p className="text-2xl font-bold text-gray-900">En progreso</p>
          <p className="text-sm text-gray-500 mt-2">
            Todo marcha según lo planeado
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Actividad Reciente
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {clientData.recentActivity.length}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Actualizaciones esta semana
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/portal/projects"
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 hover:shadow-md transition-shadow border border-blue-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Explorar Proyectos
          </h3>
          <p className="text-gray-600">
            Accede a reuniones, documentos y diseños de tus proyectos
          </p>
        </Link>

        <Link
          href="/portal/budgets"
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 hover:shadow-md transition-shadow border border-purple-200"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Ver Presupuestos
          </h3>
          <p className="text-gray-600">
            Revisa y gestiona las propuestas comerciales
          </p>
        </Link>
      </div>

      {/* Próximos pasos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Pasos</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Asistir a la próxima reunión
              </h3>
              <p className="text-sm text-gray-600">
                {nextMeeting.date} a las {nextMeeting.time}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Revisar los últimos diseños
              </h3>
              <p className="text-sm text-gray-600">
                Nuevas actualizaciones disponibles en Figma
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Proporcionar feedback
              </h3>
              <p className="text-sm text-gray-600">
                Tu opinión es fundamental para el éxito del proyecto
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA de contacto */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          ¿Tienes alguna pregunta?
        </h3>
        <p className="text-gray-600 mb-4">
          Estamos aquí para ayudarte en cada paso del proceso
        </p>
        <div className="flex justify-center gap-3">
          <a
            href="mailto:contacto@whapy.com"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Contactar al equipo
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
