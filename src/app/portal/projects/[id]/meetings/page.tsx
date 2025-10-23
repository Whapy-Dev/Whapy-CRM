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
};

export default async function ProjectMeetingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const meetings: Meeting[] = [
    {
      id: "1",
      title: "Kickoff - Inicio del Proyecto",
      date: "2025-09-15T10:00:00Z",
      duration: "1h 30min",
      recording_url: "https://drive.google.com/file/d/example123",
      summary_pdf_url: "/documents/meeting-1-summary.pdf",
      notes:
        "Definimos los objetivos principales del proyecto, alcance y cronograma inicial. Se acordó la metodología de trabajo y los entregables principales.",
    },
    {
      id: "2",
      title: "Revisión de Wireframes",
      date: "2025-09-22T15:00:00Z",
      duration: "45min",
      recording_url: "https://drive.google.com/file/d/example456",
      summary_pdf_url: "/documents/meeting-2-summary.pdf",
      notes:
        "Presentación y validación de wireframes iniciales. Se realizaron ajustes en la navegación principal y la estructura de las secciones.",
    },
    {
      id: "3",
      title: "Sprint Review #1",
      date: "2025-10-01T11:00:00Z",
      duration: "1h",
      recording_url: "https://drive.google.com/file/d/example789",
      summary_pdf_url: "/documents/meeting-3-summary.pdf",
      notes:
        "Demostración del progreso del primer sprint. Se validaron las funcionalidades del home y el sistema de navegación.",
    },
    {
      id: "4",
      title: "Revisión de Diseño UI",
      date: "2025-10-08T14:00:00Z",
      duration: "1h 15min",
      recording_url: "https://drive.google.com/file/d/example101",
      summary_pdf_url: "/documents/meeting-4-summary.pdf",
      notes:
        "Aprobación final del diseño visual. Se definieron paleta de colores, tipografías y componentes principales de la UI.",
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
        <p className="mt-2 text-gray-600">
          Reuniones y grabaciones del proyecto
        </p>
      </div>

      {/* Client Component con interactividad */}
      <MeetingsContent meetings={meetings} projectId={id} />
    </div>
  );
}
