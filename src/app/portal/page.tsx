"use client";

import Link from "next/link";
import {
  CheckCircle,
  ArrowRight,
  FolderOpen,
  Video,
  Calendar,
} from "lucide-react";
import { useDatosUser } from "@/hooks/user/datosUser";
import { useProjectsUser } from "@/hooks/user/projectsUser";
import { useAllMeetingsUser } from "@/hooks/user/useAllMeetings";
import { useAuth } from "@/hooks/useAuth";
import { usePasosUser } from "@/hooks/user/usePasosUser";

export default function PortalDashboard() {
  const { user, loading: authLoading, name } = useAuth();

  const { data: userData, isLoading: isLoadingUserData } = useDatosUser(user);
  const { data: projectsData = [], isLoading: isLoadingProjects } =
    useProjectsUser(user);
  const {
    data: allMeetingsData = [],
    isLoading: isLoadingAllMeetingsData,
    error: errorAllMeetingsData,
  } = useAllMeetingsUser(user);
  const { data: pasos, isLoading: isLoadingPasos } = usePasosUser(user);
  const loading = authLoading || isLoadingUserData || isLoadingProjects;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (isLoadingAllMeetingsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando proyectos...</p>
        </div>
      </div>
    );
  }

  if (errorAllMeetingsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <p className="text-red-800">Error: {errorAllMeetingsData.message}</p>
        </div>
      </div>
    );
  }

  const activeProjects = projectsData.filter(
    (project) => project.status !== "pausado" && project.status !== "cancelado"
  ).length;

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

  // Obtener la próxima reunión
  const now = new Date();
  const upcomingMeetings = allMeetingsData
    ?.filter((meeting) => new Date(meeting.start_at) > now)
    .sort(
      (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
    );

  const nextMeeting = upcomingMeetings?.[0];
  const nextMeetingFormatted = nextMeeting
    ? formatDate(nextMeeting.start_at)
    : null;
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - 30);

  const proyectosUltimos30Dias = projectsData.filter((project) => {
    const createdAt = new Date(project.created_at);
    return createdAt >= fechaLimite;
  });

  const meetingsUltimos30Dias = allMeetingsData?.filter((meeting) => {
    const startAt = new Date(meeting.start_at);
    return startAt >= fechaLimite;
  });

  const totalProyectos30Dias = proyectosUltimos30Dias.length;
  const totalMeetings30Dias = meetingsUltimos30Dias?.length ?? 0;
  const totalActividad30Dias = totalProyectos30Dias + totalMeetings30Dias;

  // Usar el nombre del hook useAuth o el de userData
  const displayName = name || userData?.nombre || "Usuario";
  const items = [
    { titulo: pasos?.paso_titulo_1, detalle: pasos?.paso_detalle_1 },
    { titulo: pasos?.paso_titulo_2, detalle: pasos?.paso_detalle_2 },
    { titulo: pasos?.paso_titulo_3, detalle: pasos?.paso_detalle_3 },
  ].filter((p) => p.titulo);

  return (
    <div className="space-y-6 p-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">¡Hola, {displayName}! 👋</h1>
        <p className="text-blue-100 text-lg">
          Bienvenido a tu portal personalizado de Whapy LLC
        </p>
      </div>

      {/* Quick Stats */}
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
          <h3 className="text-lg font-bold text-gray-900">
            Explorar Proyectos
          </h3>
          <p className="text-3xl font-bold text-gray-900">{activeProjects}</p>
          <p className="text-gray-600">
            Accede a reuniones, documentos y diseños de tus proyectos
          </p>
        </Link>

        <a
          href="https://calendly.com/admin-whapy/40min/2025-09-12T16:00:00-03:00"
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 hover:shadow-md transition-shadow border border-purple-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <ArrowRight className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Agendar Reunión
          </h3>
          <p className="text-gray-600">Agendá una reunión con nosotros</p>
        </a>
      </div>

      {/* Próximos pasos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Pasos</h2>

        <div className="space-y-3">
          {items.map((p, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {i + 1}
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">{p.titulo}</h3>
                <p className="text-sm text-gray-600">{p.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actividad reciente */}
      {totalActividad30Dias > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Actividad de los últimos 30 días
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <FolderOpen className="w-5 h-5 text-blue-600" />
                <h3 className="font-medium text-gray-900">Proyectos</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {totalProyectos30Dias}
              </p>
              <p className="text-sm text-gray-600">Nuevos proyectos</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Video className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-gray-900">Reuniones</h3>
              </div>
              <p className="text-3xl font-bold text-green-600">
                {totalMeetings30Dias}
              </p>
              <p className="text-sm text-gray-600">Reuniones realizadas</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-5 h-5 text-purple-600" />
                <h3 className="font-medium text-gray-900">Total</h3>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {totalActividad30Dias}
              </p>
              <p className="text-sm text-gray-600">Actividades totales</p>
            </div>
          </div>
        </div>
      )}

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
            href="mailto:admin@whapy.com"
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
