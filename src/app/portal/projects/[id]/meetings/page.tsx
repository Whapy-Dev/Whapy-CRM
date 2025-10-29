"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MeetingsContent from "./MeetingsContent";

type Meeting = {
  id: string;
  title: string;
  date: string;
  duration: string;
  recording_url?: string;
  summary_pdf_url?: string;
  notes: string;
  projects: [
    {
      title: string;
    }
  ];
};

import { use } from "react";
import { useAllMeetingsByProjectId } from "@/hooks/user/useAllMeetings";

export default function ProjectMeetingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params); // ⚡ aquí obtenemos correctamente el ID
  console.log("Project ID:", id);
  const {
    data: meetings = [],
    isLoading,
    error,
  } = useAllMeetingsByProjectId(id);

  if (isLoading) {
    return <div>Cargando reuniones...</div>;
  }
  if (error) {
    return <div>Error al cargar las reuniones: {error.message}</div>;
  }
  if (!isLoading && !error && meetings.length === 0) {
    return <div>No hay reuniones disponibles para este proyecto.</div>;
  }

  const projectName = meetings[0].projects[0]?.title;

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

      {/* Client Component con interactividad */}
      <MeetingsContent meetings={meetings} projectId={id} />
    </div>
  );
}
