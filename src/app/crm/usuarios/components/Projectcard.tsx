import { Document, Meeting, Project } from "../page";

type ProjectCardProps = {
  project: Project;
  onEditClick: () => void;
  onAssignDocument: () => void;
  onAssignMeeting: () => void;
};

export default function ProjectCard({
  project,
  onEditClick,
  onAssignDocument,
  onAssignMeeting,
}: ProjectCardProps) {
  let statusColor = "bg-gray-100 text-gray-800";
  if (project.status === "En progreso")
    statusColor = "bg-yellow-100 text-yellow-800";
  if (project.status === "Terminado")
    statusColor = "bg-green-100 text-green-800";
  if (project.status === "Cancelado") statusColor = "bg-red-100 text-red-800";

  return (
    <div className="p-6 rounded-2xl shadow-md border border-gray-200 bg-gradient-to-r from-white to-gray-50 hover:border hover:border-black">
      <div className="flex items-center justify-between">
        <p
          className={`px-4 py-1 inline-block rounded-full ${statusColor} font-semibold`}
        >
          {project.status}
        </p>
        <button
          type="button"
          onClick={onEditClick}
          className="px-4 py-2 bg-gray-300 rounded-lg font-medium duration-150 hover:bg-gray-400 transition-colors cursor-pointer"
        >
          Editar proyecto
        </button>
      </div>
      <h4 className="text-lg font-semibold mb-2">
        {project.title}{" "}
        <span className="text-sm text-gray-500 font-normal">
          {project.progress}%
        </span>
      </h4>
      <p className="mb-4 text-gray-700">{project.descripcion}</p>

      {/* Documentos */}
      <div className="mb-4 p-4 bg-blue-50 rounded-xl shadow-inner border border-blue-100">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-semibold text-blue-700">Documentos</h5>
          <button
            onClick={onAssignDocument}
            className="px-2 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 cursor-pointer"
          >
            + Asignar Documento
          </button>
        </div>
        {project.documents?.length ? (
          <ul className="list-disc ml-5 space-y-1 text-blue-800">
            {project.documents.map((doc: Document) => (
              <li key={doc.id}>
                <a
                  href={doc.document_url}
                  target="_blank"
                  className="underline hover:text-blue-900"
                >
                  {doc.title} ({doc.category_document})
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-blue-600">No hay documentos</p>
        )}
      </div>

      {/* Reuniones */}
      <div className="p-4 bg-green-50 rounded-xl shadow-inner border border-green-100">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-semibold text-green-700">Reuniones</h5>
          <button
            onClick={onAssignMeeting}
            className="px-2 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 cursor-pointer"
          >
            + Asignar Reunión
          </button>
        </div>
        {project.all_meetings?.length ? (
          <ul className="list-disc ml-5 space-y-1 text-green-800">
            {project.all_meetings.map((meeting: Meeting) => (
              <li key={meeting.meeting_id}>
                {meeting.title} ({meeting.type}) -{" "}
                <a
                  href={meeting.meet_url}
                  target="_blank"
                  className="underline hover:text-green-900"
                >
                  Ver reunión
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-green-600">No hay reuniones</p>
        )}
      </div>
    </div>
  );
}
