"use client";
import { ProjectWithProfiles } from "@/hooks/admin/useProjects";
import { MoreVertical } from "lucide-react";
import React from "react";
interface Props {
  projects: ProjectWithProfiles[];
}

export default function ProjectsTable({ projects }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Proyecto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              PM & Squad
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Progreso
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Deadline
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-slate-200">
          {projects.map((project) => (
            <tr
              key={project.id}
              className="hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              {/* Col 1: Proyecto */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="ml-4">
                    <div className="text-sm font-medium text-slate-900">
                      {project.title}
                    </div>
                  </div>
                </div>
              </td>

              {/* Col 2: PM & Squad */}
              <td className="px-6 py-4">
                <div className="flex items-center">
                  {project.profiles.length > 0 && (
                    <>
                      {/* PM avatar (primero) */}
                      <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500 -mr-2">
                        {project.profiles[0].nombre.charAt(0)}
                      </div>

                      {/* +X restante */}
                      {project.profiles.length > 1 && (
                        <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs font-medium text-slate-500 z-10 ml-2">
                          +{project.profiles.length - 1}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </td>

              {/* Col 3: Progreso */}
              <td className="px-6 py-4 w-48">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progreso</span>
                  <span className="font-bold">{project.progress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-indigo-600 h-1.5 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </td>

              {/* Col 4: Deadline */}
              <td className="px-6 py-4">
                <div className="text-sm text-slate-900">
                  {project.created_at}
                </div>
              </td>

              {/* Col 5: Estado */}
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    project.progress < 50
                      ? "bg-red-100 text-red-800"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {project.status}
                </span>
              </td>

              {/* Col 6: Flecha */}
              <td className="px-6 py-4 text-right">
                <button className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
