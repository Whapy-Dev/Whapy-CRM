"use client";

import { useState } from "react";
import { useProfiles } from "@/hooks/admin/useProfiles";

import { Plus, Search } from "lucide-react";
import ClientsTable from "./components/Clientstable";
import CreateAccountModal from "./components/Createaccountmodal";

export type Document = {
  id: string;
  user_id: string;
  project_id?: string | null;
  lead_id?: string | null;
  title: string;
  document_url: string;
  category_document: string;
  type_document: string;
  created_at: string;
};

export type Video = {
  id: string;
  user_id?: string | null;
  meeting_id?: string | null;
  project_id?: string | null;
  vimeo_id: string;
  vimeo_url: string;
  title: string;
  status: string;
  descripcion: string;
  duration?: string | null;
  created_at: string;
  type_video: string;
};

export type Meeting = {
  meeting_id: string;
  project_id: string;
  lead_id?: string | null;
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
  duration?: string | null;
  type: string;
  videos?: Video[] | null;
};

export type Project = {
  id: string;
  lead_id?: string | null;
  user_id: string;
  title: string;
  descripcion: string;
  created_at: string;
  status: "En progreso" | "Terminado" | "Cancelado" | "Pausado";
  progress: number;
  documents?: Document[] | null;
  videos?: Video[] | null;
};

export type Pasos = {
  id: string;
  paso_titulo_1: string;
  paso_detalle_1: string;
  paso_titulo_2: string;
  paso_detalle_2: string;
  paso_titulo_3: string;
  paso_detalle_3: string;
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
  projects?: Project[] | null;
  project_users?: { project: Project }[];
  type: string;
  genero: string;
  fechaNacimiento: string;
  pais: string;
  detalles?: string | null;
  estado: string;
  videos?: Video[] | null;
  pasos?: Pasos[] | null;
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
    const proyectos = client.project_users || [];

    const isActivo = proyectos.some((p) => p.project?.status === "En progreso");

    const isInactivo = proyectos.some((p) => p.project?.status === "Pausado");

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
  // Estados de modales
  const [showModal, setShowModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
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
          refetchProfiles={refetchProfiles}
        />
      </div>
    </>
  );
}
