"use client";

import { useState } from "react";
import { useProfiles } from "@/hooks/admin/useProfiles";
import EditProjectModal from "./components/Editprojectmodal";
import AssignDocumentModal from "./components/Assigndocumentmodal";
import ClientDetailsModal from "./components/Clientdetailsmodal";
import CreateAccountModal from "./components/Createaccountmodal";
import ClientsTable from "./components/Clientstable";
import AssignMeetingModal from "./components/Assignmeetingmodal";
import { Plus, Search } from "lucide-react";
export type Document = {
  id: string;
  user_id: string;
  project_id: string;
  lead_id: string;
  title: string;
  document_url: string;
  category_document: string;
  type_document: string;
  created_at: string;
};

export type Meeting = {
  meeting_id: string;
  project_id: string;
  lead_id: string;
  user_id: string;
  title: string;
  start_at: string;
  location: string;
  meet_url: string;
  summary_md: string;
  summary_pdf_url: string;
  type_meeting: string;
  created_at: string;
  estado: string;
  duration: string;
  type: string;
};

export type Project = {
  id: string;
  lead_id: string;
  user_id: string;
  title: string;
  descripcion: string;
  created_at: string;
  status: "En progreso" | "Terminado" | "Cancelado" | "Pausado";
  progress: number;
  documents: Document[] | null;
  all_meetings: Meeting[] | null;
};

export type Client = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  ciudad: string;
  codigoPostal: string;
  created_at: string;
  projects: Project[] | null;
  type: string;
  genero: string;
  fechaNacimiento: string;
  pais: string;
  detalles: string;
  estado: string;
};

export type InsertData = {
  project_id: string;
  title: string;
  document_url: string;
  category_document: string;
  type_document: string;
  user_id?: string;
  lead_id?: string;
};
export type InsertMeetingData = {
  project_id: string;
  title: string;
  start_at: string;
  location: string;
  meet_url: string;
  summary_md: string;
  summary_pdf_url: string;
  type_meeting: string;
  estado: string;
  duration: string;
  lead_id?: string;
  user_id?: string;
};
export default function ClientsPageUnsafe() {
  const {
    data: dataProfiles = [],
    isLoading: isLoadingProfiles,
    error: errorProfiles,
    refetch: refetchProfiles,
  } = useProfiles();

  const normalizedProfiles = dataProfiles.map((client: Client) => {
    const proyectos = client.projects || [];
    const isActivo = proyectos.some((p) => p.status === "En progreso");
    const isInactivo = proyectos.some((p) => p.status === "Pausado");

    let estado: "Activo" | "Inactivo" | "Sin proyectos" = "Sin proyectos";
    if (isActivo) estado = "Activo";
    else if (isInactivo) estado = "Inactivo";
    return {
      ...client,
      estado,
    };
  });

  // Estados de selección
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Estados de modales
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);

  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");

  // Filtrado de clientes
  const term = searchTerm.toLowerCase();
  const filteredAccounts = normalizedProfiles.filter((profile) => {
    const matchesSearch =
      (profile.nombre?.toLowerCase() || "").includes(term) ||
      (profile.email?.toLowerCase() || "").includes(term) ||
      (profile.telefono?.toLowerCase() || "").includes(term);

    const matchesTipo =
      selectedTipo === "" ||
      profile.type?.toLowerCase() === selectedTipo.toLowerCase();

    const matchesEstado =
      selectedEstado === "" ||
      profile.estado.toLowerCase() === selectedEstado.toLowerCase();

    return matchesSearch && matchesTipo && matchesEstado;
  });

  if (isLoadingProfiles) return <div>Cargando clientes...</div>;
  if (errorProfiles) return <div>Error: {errorProfiles.message}</div>;

  return (
    <>
      {/* Acciones y búsqueda */}
      <div className="p-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
          <p className="mt-2 text-gray-600">
            Gestiona tus clientes y crea cuentas para acceder al portal
          </p>
        </div>

        {/* Acciones y búsqueda */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
          <select
            value={selectedTipo}
            onChange={(e) => setSelectedTipo(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas los usuarios</option>
            <option value="Cliente">Cliente</option>
            <option value="Lead">Lead</option>
          </select>

          <select
            value={selectedEstado}
            onChange={(e) => setSelectedEstado(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tipo de usuario</option>
            <option value="Activo">Activo</option>
            <option value="Inactivo">Inactivo</option>
            <option value="Sin proyectos">Sin proyectos</option>
          </select>

          <button
            onClick={() => {
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Crear Cuenta de usuario
          </button>
        </div>

        {/* Tabla de clientes */}
        <ClientsTable
          clients={filteredAccounts}
          onClientClick={(client) => {
            setSelectedClient(client);
            setShowClientModal(true);
          }}
        />

        {/* Modal Crear Cuenta */}
        <CreateAccountModal
          show={showModal}
          onClose={() => setShowModal(false)}
        />

        {/* Modal Detalles del Cliente */}
        <ClientDetailsModal
          show={showClientModal}
          client={selectedClient}
          onClose={() => setShowClientModal(false)}
          onEditProject={(project) => {
            setSelectedProject(project);
            setShowEditProject(true);
          }}
          onAssignDocument={(project) => {
            setSelectedProject(project);
            setShowDocumentModal(true);
          }}
          onAssignMeeting={(project) => {
            setSelectedProject(project);
            setShowMeetingModal(true);
          }}
        />

        {/* Modal Editar Proyecto */}
        <EditProjectModal
          show={showEditProject}
          project={selectedProject}
          onClose={() => setShowEditProject(false)}
        />

        {/* Modal Asignar Documento */}
        <AssignDocumentModal
          show={showDocumentModal}
          project={selectedProject}
          client={selectedClient}
          onClose={() => setShowDocumentModal(false)}
          refetchProfiles={refetchProfiles}
        />
        <AssignMeetingModal
          show={showMeetingModal}
          project={selectedProject}
          client={selectedClient}
          onClose={() => setShowMeetingModal(false)}
          refetchProfiles={refetchProfiles}
        />
      </div>
    </>
  );
}
