"use client";

import { useState } from "react";
import { Client, Project } from "../../page";
import ProjectCard from "../../components/Projectcard";
import EditClientStepsModal from "../../components/editPasosModal";
import DeleteAccountModal from "../../components/DeleteAccountModal";
import ShowEditClientModal from "../../components/EditClient";
import AssignProjectModal from "../../components/Assignprojectmodal";
import EditDetallesModal from "../../components/EditDetallesModal";
import AssignDocumentModal from "../../components/Assigndocumentmodal";
import EditProjectModal from "../../components/Editprojectmodal";

type ClientDetailsPageProps = {
  client: Client;
  refetchProfile: () => void;
};
function formatDate(dateString: string) {
  if (!dateString) return "—";

  // Si viene como YYYY-MM-DD → la convertimos a DD/MM/YYYY
  if (dateString.includes("-")) {
    const [year, month, day] = dateString.split("-");
    return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${year}`;
  }

  // Si viniera como DD/MM/YYYY → simplemente la devolvemos igual
  if (dateString.includes("/")) {
    return dateString;
  }

  return "—";
}
export default function ClientContentPage({
  client,
  refetchProfile,
}: ClientDetailsPageProps) {
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showNewProjectClientModal, setShowNewProjectClientModal] =
    useState(false);
  const [showEditPasosClientModal, setShowEditPasosClientModal] =
    useState(false);
  const [showEditDetalles, setShowEditDetalles] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const onEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditProject(true);
  };

  return (
    <>
      <div className="p-6 space-y-8">
        {/* Título */}
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">
            {client?.nombre || "—"}
          </h2>

          <div className="flex gap-3">
            <button
              className="px-6 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 font-medium cursor-pointer"
              onClick={() => setShowDeleteAccount(true)}
            >
              Eliminar cuenta
            </button>

            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-medium cursor-pointer"
              onClick={() => setShowEditPasosClientModal(true)}
            >
              Editar pasos
            </button>

            <button
              className="px-6 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-medium cursor-pointer"
              onClick={() => setShowEditClientModal(true)}
            >
              Editar cliente
            </button>
          </div>
        </div>

        {/* Datos Personales */}
        <div className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200">
          <h3 className="text-xl font-semibold text-blue-700 mb-4">
            Datos Personales
          </h3>

          <div className="grid grid-cols-6 gap-10 text-gray-800">
            <div className="flex flex-col gap-1 col-span-1">
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

            <div className="flex flex-col gap-1 col-span-1">
              <p>
                <strong>Tipo:</strong> {client.type || "—"}
              </p>
              <p>
                <strong>Género:</strong> {client.genero || "—"}
              </p>
              <p>
                <strong>Fecha de Nacimiento:</strong>{" "}
                {formatDate(client.fechaNacimiento)}
              </p>
              <p>
                <strong>País:</strong> {client.pais || "—"}
              </p>
            </div>
            <div className="mt-1 col-span-4 ">
              <p className="overflow-hidden text-gray-800 whitespace-normal max-h-48">
                <strong>Detalles:</strong> {client.detalles || "—"}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditDetalles(true);
                }}
                className="text-blue-600 underline mt-1 cursor-pointer"
              >
                Ver más
              </button>
            </div>
          </div>
        </div>

        {/* Proyectos */}
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-gray-900">Proyectos</h3>
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
                refetchProfile={refetchProfile}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No tiene proyectos</p>
        )}

        {/* MODALES: ahora funcionan como modales pero la página NO es modal */}
      </div>
      <EditClientStepsModal
        show={showEditPasosClientModal}
        client={client}
        onClose={() => setShowEditPasosClientModal(false)}
        refetchProfile={refetchProfile}
      />
      <DeleteAccountModal
        show={showDeleteAccount}
        client={client}
        onClose={() => setShowDeleteAccount(false)}
        refetchProfile={refetchProfile}
      />
      <ShowEditClientModal
        show={showEditClientModal}
        client={client}
        onClose={() => setShowEditClientModal(false)}
        refetchProfile={refetchProfile}
      />
      <EditDetallesModal
        show={showEditDetalles}
        client={client}
        onClose={() => setShowEditDetalles(false)}
        refetchProfile={refetchProfile}
      />
      <AssignProjectModal
        show={showNewProjectClientModal}
        client={client}
        onClose={() => setShowNewProjectClientModal(false)}
        refetchProfile={refetchProfile}
      />
      <AssignDocumentModal
        show={showDocumentModal}
        project={selectedProject}
        client={client}
        onClose={() => setShowDocumentModal(false)}
        refetchProfile={refetchProfile}
      />
      <EditProjectModal
        show={showEditProject}
        client={client}
        project={selectedProject}
        onClose={() => setShowEditProject(false)}
        refetchProfile={refetchProfile}
      />
    </>
  );
}
