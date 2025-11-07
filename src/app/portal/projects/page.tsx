"use client";

import React from "react";
import Link from "next/link";
import {
  FolderOpen,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
  Play,
} from "lucide-react";
import { useProjectsUser } from "@/hooks/user/projectsUser";
import { useAuth } from "@/hooks/useAuth";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Project = {
  id: string;
  name: string;
  description: string;
  status: "en_progreso" | "completado" | "pendiente";
  progress: number;
  start_date: string;
  meetings_count: number;
  documents_count: number;
  has_figma: boolean;
};

export default function ProjectsPage() {
  const { user, loading } = useAuth();
  const {
    data: projectsData = [],
    isLoading: isLoadingProjects,
    error: errorProjects,
  } = useProjectsUser(user);
  if (loading) return <p>Cargando usuario...</p>;

  if (isLoadingProjects) return <p>Cargando proyectos...</p>;
  if (!isLoadingProjects && !errorProjects && projectsData.length === 0)
    return <p>No hay proyectos disponibles</p>;
  if (errorProjects) return <p>Error: {errorProjects.message}</p>;

  const statusConfig = {
    en_progreso: {
      color: "bg-blue-100 text-blue-800",
      label: "en progreso",
      dotColor: "bg-blue-600",
    },
    terminado: {
      color: "bg-emerald-100 text-emerald-800",
      label: "terminado",
      dotColor: "bg-emerald-600",
    },
    pausado: {
      color: "bg-orange-100 text-orange-800",
      label: "pausado",
      dotColor: "bg-orange-600",
    },
    cancelado: {
      color: "bg-red-100 text-red-800",
      label: "cancelado",
      dotColor: "bg-red-600",
    },
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return "bg-red-600";
    if (progress < 70) return "bg-yellow-600";
    return "bg-green-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Proyectos</h1>
        <p className="mt-2 text-gray-600">
          Accede a todos tus proyectos, reuniones y recursos de diseño
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {projectsData?.length}
          </p>
          <p className="text-sm text-gray-600">Proyectos Activos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {projectsData?.reduce(
              (sum, p) => sum + (p.all_meetings?.length || 0),
              0
            )}
          </p>
          <p className="text-sm text-gray-600">Reuniones Totales</p>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projectsData?.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {/* Project Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {project.title}
                    </h2>
                    {(() => {
                      // Mapear status de la DB a las claves de statusConfig
                      const mapStatusKey = (status: string) => {
                        switch (status.toLowerCase()) {
                          case "en progreso":
                            return "en_progreso";
                          case "terminado":
                            return "terminado";
                          case "cancelado":
                            return "cancelado";
                          case "pausado":
                            return "pausado";
                          default:
                            return undefined;
                        }
                      };

                      const statusKey = mapStatusKey(project.status);

                      return (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusKey
                              ? statusConfig[statusKey].color
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              statusKey
                                ? statusConfig[statusKey].dotColor
                                : "bg-gray-600"
                            }`}
                          ></span>
                          {statusKey
                            ? statusConfig[statusKey].label
                            : "Desconocido"}
                        </span>
                      );
                    })()}
                  </div>
                  <p className="text-gray-600 mb-3">{project.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Inicio:{" "}
                      {new Date(project.created_at).toLocaleDateString("es-AR")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project?.all_meetings?.length || 0} grabaciones
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progreso del Proyecto
                  </span>
                  <span className="text-sm font-bold text-gray-900">
                    {project.progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${getProgressColor(
                      project.progress
                    )}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Project Actions */}

            <div className="p-6 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-3">
              {project?.id && (
                <Link
                  href={`/portal/projects/${project.id}/meetings`}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Grabaciones</h3>
                      <p className="text-sm text-gray-500">
                        {project?.all_meetings?.length || 0} grabaciones
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </Link>
              )}
              {project?.id && (
                <Link
                  href={`/portal/projects/${project.id}/documents`}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <FolderOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Documentacion
                      </h3>
                      <p className="text-sm text-gray-500">
                        {project?.documents?.length || 0} archivos
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                </Link>
              )}

              {project.consumo ? (
                <Link
                  href={`/portal/projects/${project.id}/design`}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <svg
                        className="w-5 h-5 text-green-600"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 2C6.895 2 6 2.895 6 4v16c0 1.105.895 2 2 2s2-.895 2-2V4c0-1.105-.895-2-2-2zm8 0c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2s2-.895 2-2V4c0-1.105-.895-2-2-2zm0 12c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zM8 10c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">Consumos</h3>
                      <p className="text-sm text-gray-500">Ver en Figma</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </Link>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-100 border border-gray-200 rounded-lg opacity-50 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-200 rounded-lg">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M8 2C6.895 2 6 2.895 6 4v16c0 1.105.895 2 2 2s2-.895 2-2V4c0-1.105-.895-2-2-2zm8 0c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2s2-.895 2-2V4c0-1.105-.895-2-2-2zm0 12c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zM8 10c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-500">Consumos</h3>
                      <p className="text-sm text-gray-400">No disponible</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {projectsData?.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tienes proyectos activos
          </h3>
          <p className="text-gray-600">
            Los proyectos aparecerán aquí una vez que comiences a trabajar con
            nosotros
          </p>
        </div>
      )}
    </div>
  );
}
