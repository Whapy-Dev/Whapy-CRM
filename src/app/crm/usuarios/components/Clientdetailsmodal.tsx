import { useState } from "react";
import { Client, Project } from "../page";
import ProjectCard from "./Projectcard";
import ShowEditClientModal from "./EditClient";
import AssignProjectModal from "./Assignprojectmodal";
import EditDetallesModal from "./EditDetallesModal";
import AssignDocumentModal from "./Assigndocumentmodal";
import AssignMeetingModal from "./Assignmeetingmodal";
import EditPasosClient from "./editPasosModal";
import DeleteAccountModal from "./DeleteAccountModal";

type ClientDetailsModalProps = {
  show: boolean;
  client: Client | null;
  onClose: () => void;
  onEditProject: (project: Project) => void;
  refetchProfiles: () => void;
};

export default function ClientDetailsModal({
  show,
  client,
  onClose,
  onEditProject,
  refetchProfiles,
}: ClientDetailsModalProps) {
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showNewProjectClientModal, setShowNewProjectClientModal] =
    useState(false);
  const [showEditPasosClientModal, setShowEditPasosClientModal] =
    useState(false);
  const [showEditDetalles, setShowEditDetalles] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [currentDetalles, setCurrentDetalles] = useState(
    client?.detalles || ""
  );

  // nuevos estados para documentos y reuniones
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  if (!show || !client) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-3xl p-6 w-full overflow-y-auto max-h-[90vh] shadow-2xl border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              {client?.nombre || "—"}
            </h2>

            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 rounded-2xl hover:bg-gray-400 font-medium cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          {/* Datos Personales */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-md border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-semibold text-blue-700">
                Datos Personales
              </h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="px-4 py-1 bg-red-600 text-white rounded-2xl hover:bg-red-700 font-medium cursor-pointer"
                  onClick={() => setShowDeleteAccount(true)}
                >
                  Eliminar cuenta
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditPasosClientModal(true)}
                  className="px-4 py-1 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-medium cursor-pointer"
                >
                  Editar pasos
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditClientModal(true)}
                  className="px-4 py-1 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-medium cursor-pointer"
                >
                  Editar cliente
                </button>
              </div>
            </div>

            <div className="flex gap-10 text-gray-800 flex-wrap">
              <div className="flex flex-col justify-center min-w-[250px]">
                <p>
                  <strong>Email:</strong> {client.email}
                </p>
                <p>
                  <strong>Teléfono:</strong> {client.telefono || "—"}
                </p>
                <p>
                  <strong>Empresa:</strong> {client.empresa || "—"}
                </p>
                <p>
                  <strong>Ciudad:</strong> {client.ciudad || "—"}
                </p>
                <p>
                  <strong>Código Postal:</strong> {client.codigoPostal || "—"}
                </p>
              </div>

              <div className="flex flex-col justify-center min-w-[250px]">
                <p>
                  <strong>Tipo:</strong> {client.type || "—"}
                </p>
                <p>
                  <strong>Género:</strong> {client.genero || "—"}
                </p>
                <p>
                  <strong>Fecha de Nacimiento:</strong>{" "}
                  {client.fechaNacimiento || "—"}
                </p>
                <p>
                  <strong>País:</strong> {client.pais || "—"}
                </p>
                <div
                  className="mb-1 max-w-[300px] cursor-pointer"
                  onClick={() => setShowEditDetalles(true)}
                >
                  <p className="overflow-hidden text-ellipsis whitespace-nowrap inline-block align-middle">
                    <strong>Detalles:</strong>{" "}
                    {client.detalles
                      ? client.detalles.length > 50
                        ? client.detalles.slice(0, 50) + "..."
                        : client.detalles
                      : "—"}
                  </p>
                  {client.detalles && client.detalles.length > 50 && (
                    <span className="text-gray-500 text-xs ml-1 align-middle">
                      ({client.detalles.length} caracteres)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Proyectos */}
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">
              Proyectos
            </h3>
            <button
              onClick={() => setShowNewProjectClientModal(true)}
              className="px-4 py-1 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-medium cursor-pointer"
            >
              Crear Proyecto
            </button>
          </div>

          {client.projects?.length ? (
            <div className="grid grid-cols-2 gap-5">
              {client.projects.map((project: Project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  client={client}
                  onEditClick={() => onEditProject(project)}
                  onAssignDocument={() => {
                    setSelectedProject(project);
                    setShowDocumentModal(true);
                  }}
                  refetchProfiles={refetchProfiles}
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No tiene proyectos</p>
          )}
        </div>
      </div>

      {/* Modales secundarios */}
      <EditPasosClient
        show={showEditPasosClientModal}
        client={client}
        onClose={() => setShowEditPasosClientModal(false)}
        refetchProfiles={refetchProfiles}
      />
      <DeleteAccountModal
        show={showDeleteAccount}
        client={client}
        onClose={() => setShowDeleteAccount(false)}
        onDeleteSuccess={onClose}
        refetchProfiles={refetchProfiles}
      />

      <ShowEditClientModal
        show={showEditClientModal}
        client={client}
        onClose={() => setShowEditClientModal(false)}
        refetchProfiles={refetchProfiles}
      />

      <AssignProjectModal
        show={showNewProjectClientModal}
        client={client}
        onClose={() => setShowNewProjectClientModal(false)}
        refetchProfiles={refetchProfiles}
      />

      <EditDetallesModal
        show={showEditDetalles}
        client={client}
        onClose={() => setShowEditDetalles(false)}
        onUpdate={(newDetalles) => setCurrentDetalles(newDetalles)}
        refetchProfiles={refetchProfiles}
      />

      <AssignDocumentModal
        show={showDocumentModal}
        project={selectedProject}
        client={client}
        onClose={() => setShowDocumentModal(false)}
        refetchProfiles={refetchProfiles}
      />
    </>
  );
}
