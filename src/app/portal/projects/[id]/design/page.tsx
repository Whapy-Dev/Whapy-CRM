import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import DesignVersionSelector from "./DesignVersionSelector";

type DesignVersion = {
  id: string;
  version: string;
  title: string;
  figma_url: string;
  updated_at: string;
  description: string;
  is_current: boolean;
};

export default async function ProjectDesignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const versions: DesignVersion[] = [
    {
      id: "1",
      version: "v2.0",
      title: "Diseño Final Aprobado",
      figma_url: "https://www.figma.com/file/example123",
      updated_at: "2025-10-15T14:30:00Z",
      description:
        "Versión final con todos los ajustes aprobados en la última reunión",
      is_current: true,
    },
    {
      id: "2",
      version: "v1.5",
      title: "Revisión con Feedback",
      figma_url: "https://www.figma.com/file/example456",
      updated_at: "2025-10-08T10:00:00Z",
      description: "Segunda iteración incorporando feedback del cliente",
      is_current: false,
    },
    {
      id: "3",
      version: "v1.0",
      title: "Propuesta Inicial",
      figma_url: "https://www.figma.com/file/example789",
      updated_at: "2025-09-25T16:00:00Z",
      description: "Primera propuesta de diseño presentada",
      is_current: false,
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
        <p className="mt-2 text-gray-600">Diseños y prototipos del proyecto</p>
      </div>

      {/* Client Component for interactivity */}
      <DesignVersionSelector versions={versions} projectId={id} />
    </div>
  );
}
