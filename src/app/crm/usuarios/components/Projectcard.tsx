import { useState } from "react";
import { Client, Document, Meeting, Project } from "../page";

import AssignVideoProjectModal from "./Assignvideoprojectmodal";
import AssignVideoMeetingModal from "./Assignvideomeetingmodal";
import ShowVideoMeetingClientModal from "./VideoMeetingClient";
import ShowVideoProjectClientModal from "./VideoProjectClient";
import AssignPresupuestoModal from "./Assignpresupuestomodal";
import ShowDocumentsClientModal from "./Showdocuments";

type ProjectCardProps = {
  project: Project;
  client: Client;
  onEditClick: () => void;
  onAssignDocument: () => void;
  onAssignMeeting: () => void;
  refetchProfiles: () => void;
};

export default function ProjectCard({
  project,
  client,
  onEditClick,
  onAssignDocument,
  onAssignMeeting,
  refetchProfiles,
}: ProjectCardProps) {
  const [showVideoMeetingClient, setShowVideoMeetingClient] = useState(false);
  const [showVideoProjectClient, setShowVideoProjectClient] = useState(false);
  const [showUploadProjectModal, setShowUploadProjectModal] = useState(false);
  const [showUploadMeetingModal, setShowUploadMeetingModal] = useState(false);
  const [showNewPresupuestoClientModal, setShowNewPresupuestoClientModal] =
    useState(false);
  const [showDocumentsClientModal, setShowDocumentsClientModal] =
    useState(false);
  let statusColor = "bg-gray-100 text-gray-800";
  if (project.status === "En progreso")
    statusColor = "bg-yellow-100 text-yellow-800";
  if (project.status === "Terminado")
    statusColor = "bg-green-100 text-green-800";
  if (project.status === "Cancelado") statusColor = "bg-red-100 text-red-800";
  const categories = [
    "Varios",
    "Contractual",
    "Presentacion visual",
    "Presupuesto",
  ];

  const groupedDocs = categories.map((category) => {
    const docs = project.documents
      ?.filter((doc: Document) => doc.category_document === category)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 3);
    return { category, docs };
  });

  return (
    <div className="p-4 rounded-2xl shadow-md border border-gray-200 bg-gradient-to-r from-white to-gray-50 hover:border hover:border-black">
      <div className="flex items-center justify-between">
        <p
          className={`px-4 py-1 inline-block rounded-full ${statusColor} font-semibold`}
        >
          {project.status}
        </p>
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setShowVideoProjectClient(true)}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 font-medium cursor-pointer transition-colors duration-150"
          >
            Ver Videos
          </button>
          <button
            onClick={() => setShowUploadProjectModal(true)}
            className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 font-medium cursor-pointer transition-colors duration-150"
          >
            Subir Video
          </button>
          <button
            type="button"
            onClick={onEditClick}
            className="px-4 py-2 bg-gray-300 rounded-lg font-medium duration-150 hover:bg-gray-400 transition-colors cursor-pointer"
          >
            Editar proyecto
          </button>
        </div>
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewPresupuestoClientModal(true)}
              className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
            >
              Crear Presupuesto
            </button>
            <button
              onClick={() => setShowDocumentsClientModal(true)}
              className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
            >
              Ver Documentos
            </button>
            <button
              onClick={onAssignDocument}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
            >
              + Asignar Documento
            </button>
          </div>
        </div>
        {project.documents?.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {groupedDocs.map(({ category, docs }) => (
              <div key={category} className="w-auto">
                <h6 className="font-semibold capitalize text-blue-800 mb-1">
                  {category}
                </h6>
                {docs && docs.length > 0 ? (
                  <ul className="list-disc ml-5 space-y-1 text-blue-800">
                    {docs.map((doc: Document) => (
                      <li key={doc.id}>
                        <a
                          href={doc.document_url}
                          target="_blank"
                          className="underline hover:text-blue-900"
                        >
                          {doc.title}
                        </a>{" "}
                        <span className="text-xs text-gray-500">
                          ({new Date(doc.created_at).toLocaleDateString()})
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-blue-600 text-sm">No hay documentos</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-blue-600">No hay documentos</p>
        )}
      </div>
      {/* Reuniones */}
      <div className="p-4 bg-green-50 rounded-xl shadow-inner border border-green-100">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-semibold text-green-700">Videos</h5>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVideoMeetingClient(true)}
              className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer"
            >
              Ver Videos
            </button>
            <button
              onClick={() => setShowUploadMeetingModal(true)}
              className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer"
            >
              Subir Video
            </button>
            <button
              onClick={onAssignMeeting}
              className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer"
            >
              + Asignar Reunión
            </button>
          </div>
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
      <ShowVideoMeetingClientModal
        show={showVideoMeetingClient}
        project={project}
        onClose={() => setShowVideoMeetingClient(false)}
        refetchProfiles={refetchProfiles}
      />
      <ShowVideoProjectClientModal
        show={showVideoProjectClient}
        project={project}
        onClose={() => setShowVideoProjectClient(false)}
        refetchProfiles={refetchProfiles}
      />
      <AssignVideoMeetingModal
        show={showUploadMeetingModal}
        all_meetings={project.all_meetings}
        onClose={() => setShowUploadMeetingModal(false)}
        refetchProfiles={refetchProfiles}
      />
      <AssignVideoProjectModal
        show={showUploadProjectModal}
        project={project}
        onClose={() => setShowUploadProjectModal(false)}
        refetchProfiles={refetchProfiles}
      />{" "}
      <AssignPresupuestoModal
        show={showNewPresupuestoClientModal}
        client={client}
        project={project}
        onClose={() => setShowNewPresupuestoClientModal(false)}
        refetchProfiles={refetchProfiles}
      />
      <ShowDocumentsClientModal
        show={showDocumentsClientModal}
        project={project}
        onClose={() => setShowDocumentsClientModal(false)}
        refetchProfiles={refetchProfiles}
      />
    </div>
  );
}
