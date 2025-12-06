// components/ProjectSidebar.tsx
"use client";

import { Project } from "@/utils/types";

interface ProjectSidebarProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

export default function ProjectSidebar({
  projects,
  selectedProject,
  onSelectProject,
}: ProjectSidebarProps) {
  return (
    <div className="w-72 border-r pr-4">
      <h4 className="text-lg font-semibold mb-2">Proyectos</h4>
      <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
        {projects.map((p) => (
          <button
            key={p.id}
            onClick={() => onSelectProject(p)}
            className={`text-left px-4 py-2 rounded-xl border transition cursor-pointer ${
              selectedProject?.id === p.id
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            <span>{p.title}</span>
            <span
              className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                p.presupuesto
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              } ${
                selectedProject?.id === p.id ? "!bg-white/20 !text-white" : ""
              }`}
            >
              {p.presupuesto ? "Con presupuesto" : "Sin presupuesto"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
