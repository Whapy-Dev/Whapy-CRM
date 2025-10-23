import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DocumentsContent from "./documents.content";

type Document = {
  id: string;
  title: string;
  type: string;
  size: string;
  upload_date: string;
  category: string;
  url: string;
};

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const documents: Document[] = [
    {
      id: "1",
      title: "Contrato de Desarrollo Web.pdf",
      type: "PDF",
      size: "2.4 MB",
      upload_date: "2025-09-10T10:00:00Z",
      category: "Contractual",
      url: "/documents/contrato.pdf",
    },
    {
      id: "2",
      title: "Especificaciones Técnicas v2.0.pdf",
      type: "PDF",
      size: "1.8 MB",
      upload_date: "2025-09-20T14:30:00Z",
      category: "Técnico",
      url: "/documents/specs.pdf",
    },
    {
      id: "3",
      title: "Resumen Reunión Kickoff.pdf",
      type: "PDF",
      size: "856 KB",
      upload_date: "2025-09-15T16:00:00Z",
      category: "Reuniones",
      url: "/documents/meeting-1.pdf",
    },
    {
      id: "4",
      title: "Wireframes Iniciales.fig",
      type: "Figma",
      size: "3.2 MB",
      upload_date: "2025-09-22T11:00:00Z",
      category: "Diseño",
      url: "https://www.figma.com/file/example",
    },
    {
      id: "5",
      title: "Guía de Marca.pdf",
      type: "PDF",
      size: "4.1 MB",
      upload_date: "2025-09-18T09:00:00Z",
      category: "Diseño",
      url: "/documents/brand-guide.pdf",
    },
  ];

  const projectName = "Desarrollo Web Corporativo";

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
