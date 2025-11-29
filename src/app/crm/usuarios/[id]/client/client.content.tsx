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
import AccessModal from "../../components/AccessModal";
import { useAuth } from "@/hooks/useAuth";
import AssignBudgetModal from "../../components/AssignBudgetModal";
import AssignAnexoModal from "../../components/AssignAnexoModal";

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
  const { roleAdmin } = useAuth();
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [showNewProjectClientModal, setShowNewProjectClientModal] =
    useState(false);
  const [showEditPasosClientModal, setShowEditPasosClientModal] =
    useState(false);
  const [showEditDetalles, setShowEditDetalles] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showNewPresupuesto, setShowNewPresupuesto] = useState(false);
  const [showAnexoModal, setShowAnexoModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);
  const onEditProject = (project: Project) => {
    setSelectedProject(project);
    setShowEditProject(true);
  };
  const projects: Project[] =
    client.project_users?.map((pu) => pu.project) || [];
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
            {(roleAdmin === "CEO" || roleAdmin === "COO") && (
              <>
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-medium cursor-pointer"
                  onClick={() => setShowAnexoModal(true)}
                >
                  Anexo presupuesto
                </button>

                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-medium cursor-pointer"
                  onClick={() => setShowNewPresupuesto(true)}
                >
                  Asignar presupuesto
                </button>
              </>
            )}
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
              {(roleAdmin === "CEO" || roleAdmin === "COO") && (
                <button
                  type="button"
                  onClick={() => setShowAccessModal(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-2 cursor-pointer"
                >
                  Accesos
                </button>
              )}
            </div>
            {/* Detalles como card independiente */}
            <div className="p-6 bg-white rounded-2xl shadow-md border border-gray-200 col-span-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Detalles
              </h3>

              <div className="flex flex-col">
                <p className="text-gray-800 overflow-hidden whitespace-normal max-h-48">
                  {client.detalles || "—"}
                </p>

                {/* Contenedor del botón al final */}
                <div className="flex justify-end mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditDetalles(true);
                    }}
                    className="text-blue-600 underline cursor-pointer"
                  >
                    Ver más
                  </button>
                </div>
              </div>
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

        {projects.length ? (
          <div className="grid grid-cols-2 gap-5">
            {projects.map((project: Project) => (
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
      <AccessModal
        show={showAccessModal}
        client={client}
        projects={projects}
        onClose={() => setShowAccessModal(false)}
        refetchProfile={refetchProfile}
      />
      <AssignBudgetModal
        show={showNewPresupuesto}
        projects={projects}
        onClose={() => setShowNewPresupuesto(false)}
      />
      <AssignAnexoModal
        show={showAnexoModal}
        projects={projects}
        onClose={() => setShowAnexoModal(false)}
      />
      ;
    </>
  );
}
