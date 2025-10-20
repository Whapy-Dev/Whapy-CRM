"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FolderOpen,
  Calendar,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

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
  const [projects] = useState<Project[]>([
    {
      id: "1",
      name: "Desarrollo Web Corporativo",
      description: "Sitio web institucional con panel de administración y blog",
      status: "en_progreso",
      progress: 65,
      start_date: "2025-09-15",
      meetings_count: 4,
      documents_count: 3,
      has_figma: true,
    },
    {
      id: "2",
      name: "App Mobile Inventario",
      description: "Aplicación móvil para gestión de inventario en tiempo real",
      status: "en_progreso",
      progress: 30,
      start_date: "2025-10-01",
      meetings_count: 2,
      documents_count: 2,
      has_figma: true,
    },
  ]);

  const statusConfig = {
    en_progreso: {
      color: "bg-blue-100 text-blue-800",
      label: "En Progreso",
      dotColor: "bg-blue-600",
    },
    completado: {
      color: "bg-green-100 text-green-800",
      label: "Completado",
      dotColor: "bg-green-600",
    },
    pendiente: {
      color: "bg-yellow-100 text-yellow-800",
      label: "Pendiente",
      dotColor: "bg-yellow-600",
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
          <p className="text-sm text-gray-600">Proyectos Activos</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {projects.reduce((sum, p) => sum + p.meetings_count, 0)}
          </p>
          <p className="text-sm text-gray-600">Reuniones Totales</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {Math.round(
              projects.reduce((sum, p) => sum + p.progress, 0) / projects.length
            )}
            %
          </p>
          <p className="text-sm text-gray-600">Progreso Promedio</p>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((project) => (
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
                      {project.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusConfig[project.status].color
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          statusConfig[project.status].dotColor
                        }`}
                      ></span>
                      {statusConfig[project.status].label}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{project.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Inicio:{" "}
                      {new Date(project.start_date).toLocaleDateString("es-AR")}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {project.meetings_count} reuniones
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
              <Link
                href={`/portal/projects/${project.id}/meetings`}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Reuniones</h3>
                    <p className="text-sm text-gray-500">
                      {project.meetings_count} reuniones
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
              </Link>

              <Link
                href={`/portal/projects/${project.id}/documents`}
                className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-sm transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <FolderOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Documentos</h3>
                    <p className="text-sm text-gray-500">
                      {project.documents_count} archivos
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
              </Link>

              {project.has_figma ? (
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
                      <h3 className="font-medium text-gray-900">Diseño</h3>
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
                      <h3 className="font-medium text-gray-500">Diseño</h3>
                      <p className="text-sm text-gray-400">No disponible</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && (
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
