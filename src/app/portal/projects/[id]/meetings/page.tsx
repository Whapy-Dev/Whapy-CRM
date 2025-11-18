"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import MeetingsContent from "./MeetingsContent";

import { use } from "react";
import { useVideosByProjectId } from "@/hooks/user/videosUser";

export default function ProjectMeetingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  // ⚡ aquí obtenemos correctamente el ID
  const {
    data: videos = [],
    isLoading: isLoadingVideos,
    error: errorVideos,
  } = useVideosByProjectId(id);

  if (isLoadingVideos) {
    return <div>Cargando videos...</div>;
  }
  if (errorVideos) {
    return <div>Error al cargar los videos: {errorVideos?.message}</div>;
  }
  if (!isLoadingVideos && !errorVideos) {
    if (videos.length === 0) {
      return (
        <div>No hay reuniones ni videos disponibles para este proyecto.</div>
      );
    }
  }

  const projectName = videos[0]?.projects?.title ?? "Proyecto sin nombre";
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
      <MeetingsContent projectId={id} videos={videos} />
    </div>
  );
}
