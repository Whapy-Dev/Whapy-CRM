import { useState } from "react";
import { Client, Project } from "../page";

import ShowVideoClientModal from "./VideoClientModal";
import ShowDocumentsClientModal from "./Showdocuments";
import AssignVideoModal from "./Assignvideoprojectmodal";
import DeleteProjectModal from "./Deleteprojectmodal";

type ProjectCardProps = {
  project: Project;
  client: Client;
  onEditClick: () => void;
  onAssignDocument: () => void;
  refetchProfile: () => void;
};

export default function ProjectCard({
  project,
  client,
  onEditClick,
  onAssignDocument,
  refetchProfile,
}: ProjectCardProps) {
  const [showVideoClient, setShowVideoClient] = useState(false);
  const [showAssignVideo, setShowAssignVideo] = useState(false);
  const [showDocumentsClientModal, setShowDocumentsClientModal] =
    useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  let statusColor = "bg-gray-100 text-gray-800";
  if (project.status === "En progreso")
    statusColor = "bg-yellow-100 text-yellow-800";
  if (project.status === "Terminado")
    statusColor = "bg-green-100 text-green-800";
  if (project.status === "Cancelado") statusColor = "bg-red-100 text-red-800";
  const documentTypes = [
    "Presupuestos",
    "Contratos",
    "Diseño",
    "Repositorio",
    "Accesos",
    "Otros Recursos",
  ];

  const documentsCount = documentTypes.map((type) => ({
    type,
    count: (project.documents ?? []).filter(
      (doc) => doc.category_document === type
    ).length,
  }));
  const videoTypes = ["Reunion", "Video informativo"];

  const videosCount = videoTypes.map((type) => ({
    type,
    count: (project.videos ?? []).filter((v) => v.type_video === type).length,
  }));

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
            onClick={() => setShowDeleteModal(true)}
            type="button"
            className="px-4 py-2 bg-gray-300 rounded-lg font-medium hover:bg-gray-400 cursor-pointer"
          >
            Borrar proyecto
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
              onClick={() => setShowDocumentsClientModal(true)}
              className="px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
            >
              Ver Documentos
            </button>
            <button
              onClick={onAssignDocument}
              className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium cursor-pointer"
            >
              + Subir Documento
            </button>
          </div>
        </div>
        {project.documents?.length ? (
          <>
            {/* Cards de cantidades por tipo */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
              {documentsCount.map(({ type, count }) => (
                <div
                  key={type}
                  className="bg-white border border-blue-200 rounded-xl py-3 shadow-sm text-center"
                >
                  <p className="text-sm text-blue-700 font-medium text-nowrap text-center">
                    {type}
                  </p>
                  <p className="text-2xl font-bold text-blue-900">{count}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-blue-600">No hay documentos</p>
        )}
      </div>
      {/* Reuniones */}
      {/* Reuniones / Videos */}
      <div className="p-4 bg-green-50 rounded-xl shadow-inner border border-green-100">
        <div className="flex justify-between items-center mb-2">
          <h5 className="font-semibold text-green-700">Grabaciones</h5>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVideoClient(true)}
              className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer"
            >
              Ver Grabaciones
            </button>
            <button
              onClick={() => setShowAssignVideo(true)}
              className="px-2 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium cursor-pointer"
            >
              Subir Grabaciones
            </button>
          </div>
        </div>

        {(project.videos?.length ?? 0) > 0 ? (
          <>
            {/* Cards por tipo de video */}
            <div className="grid grid-cols-2  gap-3 mb-4">
              {videosCount.map(({ type, count }) => (
                <div
                  key={type}
                  className="bg-white border border-green-200 rounded-xl py-3 shadow-sm text-center"
                >
                  <p className="text-sm text-green-700 font-medium text-nowrap">
                    {type}
                  </p>
                  <p className="text-2xl font-bold text-green-900">{count}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-green-600">No hay grabaciones</p>
        )}
      </div>

      <ShowVideoClientModal
        show={showVideoClient}
        client={client}
        project={project}
        onClose={() => setShowVideoClient(false)}
        refetchProfile={refetchProfile}
      />
      <AssignVideoModal
        show={showAssignVideo}
        project={project}
        onClose={() => setShowAssignVideo(false)}
        refetchProfile={refetchProfile}
      />
      <ShowDocumentsClientModal
        show={showDocumentsClientModal}
        project={project}
        onClose={() => setShowDocumentsClientModal(false)}
        refetchProfile={refetchProfile}
      />
      <DeleteProjectModal
        project={project}
        client={client}
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        refetchProfile={refetchProfile}
      />
    </div>
  );
}
