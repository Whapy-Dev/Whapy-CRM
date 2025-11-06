"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MeetingsContent from "./MeetingsContent";

type Meeting = {
  meeting_id: string;
  project_id: string;
  lead_id: string;
  user_id: string;
  type_meeting: string;
  title: string;
  start_at: string;
  location: string;
  meet_url?: string;
  summary_md: string;
  summary_pdf_url: string;
  created_at: string;
  estado: string;
  duration: string;
  projects: { title: string } | null;
};

import { use } from "react";
import { useAllMeetingsByProjectId } from "@/hooks/user/useAllMeetings";
import { useVideosByProjectId } from "@/hooks/user/videosUser";

export default function ProjectMeetingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // ⚡ aquí obtenemos correctamente el ID
  const {
    data: meetings = [],
    isLoading: isLoadingMeetings,
    error: errorMeetings,
  } = useAllMeetingsByProjectId(id);
  const {
    data: videos = [],
    isLoading: isLoadingVideos,
    error: errorVideos,
  } = useVideosByProjectId(id);

  if (isLoadingMeetings || isLoadingVideos) {
    return <div>Cargando videos...</div>;
  }
  if (errorMeetings || errorVideos) {
    return (
      <div>
        Error al cargar los videos:{" "}
        {errorMeetings?.message || errorVideos?.message}
      </div>
    );
  }
  if (
    !isLoadingMeetings &&
    !isLoadingVideos &&
    !errorVideos &&
    !errorMeetings
  ) {
    if (videos.length === 0 && meetings.length === 0) {
      return (
        <div>No hay reuniones ni videos disponibles para este proyecto.</div>
      );
    }
  }

  const projectName = meetings[0].projects?.title ?? "Proyecto sin nombre";
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
      <MeetingsContent meetings={meetings} projectId={id} videos={videos} />
    </div>
  );
}
