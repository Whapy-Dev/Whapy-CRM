"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DocumentsContent from "./documents.content";
import { use } from "react";
import { useDocumentsByProjectId, Documents } from "@/hooks/user/useDocuments";

export default function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const {
    data: documents = [],
    isLoading,
    error,
  } = useDocumentsByProjectId(id);

  if (isLoading) {
    return <div>Cargando documentos...</div>;
  }
  if (error) {
    return <div>Error al cargar los documentos: {error.message}</div>;
  }
  if (!isLoading && !error && documents.length === 0) {
    return <div>No hay documentos disponibles para este proyecto.</div>;
  }

  const projectName = documents[0]?.projects?.title;

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
        <p className="mt-2 text-gray-600">Documentos y archivos del proyecto</p>
      </div>

      {/* Client Component con interactividad */}
      <DocumentsContent documents={documents} projectId={id} />
    </div>
  );
}
