"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useProjects } from "@/hooks/admin/useProjects";
import { useProfiles } from "@/hooks/admin/useProfiles";
import { useRoles, useUserRolProfiles } from "@/hooks/admin/useRoles";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

// Tipos
export type DocumentItem = {
  id: string;
  title: string;
  document_url: string;
  category_document: string;
  type_document: string;
  project_id: string;
  user_id: string;
  created_at: string;
};
type ProfileItem = {
  ciudad: string;
  codigoPostal: string;
  created_at: string;
  email: string;
  id: string;
  nombre: string;
  role: string;
  telefono: string;
  updated_at: string;
};

type Project = {
  id: string;
  title: string;
  descripcion: string;
  status: string;
  progress: number;
  user_id: string;
  created_at: string;
  documents: DocumentItem[];
  profiles: ProfileItem[];
};
type Client = {
  id: string;
  nombre: string;
};
const allowedRoles = ["CEO", "COO", "Desarrollador", "Diseñador"];
export default function ProjectsPage() {
  const { roleAdmin } = useAuth();
  const router = useRouter();
  const {
    data: roles,
    isLoading: loadingRoles,
    isError: errorRoles,
  } = useRoles();
  const {
    data: users,
    refetch: refetchUsers,
    isLoading: loadingUsers,
    isError: errorUsers,
  } = useUserRolProfiles();
  const {
    data: projects = [],
    isLoading,
    error,
    refetch: refetchProjects,
  } = useProjects();
  const { data: clients = [] } = useProfiles();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const filteredProjects = projects.filter((project) => {
    const title = project.title?.toLowerCase() || "";
    const status = project.status?.toLowerCase() || "";

    const term = searchTerm.toLowerCase();
    const estadoTerm = filterEstado.toLowerCase();

    // Filtrar por nombre/email/empresa, empresa adicional y estado
    const matchesSearch =
      title.includes(term) ||
      project.descripcion?.toLowerCase().includes(term) ||
      project.status?.toLowerCase().includes(term);

    const matchesEstado = estadoTerm ? status === estadoTerm : true;

    return matchesSearch && matchesEstado;
  });
  const [isOpen, setIsOpen] = useState(false);
  const [clientQuery, setClientQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const filteredClients = clients.filter((c) =>
    c.nombre.toLowerCase().includes(clientQuery.toLowerCase())
  );

  const [userId, setUserId] = useState("");
  const [title, setTitle] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (roleAdmin) {
      if (roleAdmin === "Sales manager") {
        router.replace("/crm/usuarios");
        return;
      }
      if (!allowedRoles.includes(roleAdmin)) {
        setHasAccess(false);
        router.replace("/crm");
      } else {
        setHasAccess(true);
      }
    }
  }, [roleAdmin, router]);

  if (hasAccess === null || loadingRoles || loadingUsers) {
    return <p className="p-6 text-blue-600">Validando datos...</p>;
  }

  if (errorRoles || errorUsers) {
    return <p className="p-6 text-red-600">Error al cargar datos</p>;
  }

  if (!hasAccess) {
    return null;
  }

  if (isLoading) return <div>Cargando proyectos</div>;
  if (error) return <div>Error:{error.message}</div>;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
        <p className="mt-2 text-gray-600">Gestioná tus proyectos</p>
      </div>

      {/* Acciones y búsqueda */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="En progreso">En progreso</option>
            <option value="Terminado">Terminado</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Pausado">Pausado</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button
            onClick={() => refetchProjects()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ProjectsTable filteredProjects={filteredProjects} />
      </div>
    </div>
  );
}

function ProjectsTable({ filteredProjects }: { filteredProjects: Project[] }) {
  const [viewModal, setViewModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [categoryDocument, setCategoryDocument] = useState("");
  const [typeDocument, setTypeDocument] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  // Abrir modal

  const handleView = (project: Project) => {
    setSelectedProject(project);
    setViewModal(true);
  };

  const handleNewDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (!title || !documentUrl || !categoryDocument || !typeDocument) {
      setErrorForm("Completa todos los campos antes de guardar");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorForm("");
    setSuccess(false);

    const { error } = await supabase.from("documents").insert({
      project_id: selectedProject.id,
      user_id: selectedProject.user_id,
      title: title,
      document_url: documentUrl,
      category_document: categoryDocument,
      type_document: typeDocument,
    });

    if (error) {
      console.error(error);
      setErrorForm("Error al asignar documento");
    } else {
      setSuccess(true);
      setTitle("");
      setDocumentUrl("");
      setCategoryDocument("");
      setTypeDocument("");
    }

    setLoading(false);
  };

  const statusConfig = {
    en_progreso: {
      color: "bg-blue-100 text-blue-800",
      label: "en progreso",
      dotColor: "bg-blue-600",
    },
    terminado: {
      color: "bg-green-100 text-green-800",
      label: "completado",
      dotColor: "bg-green-600",
    },
    cancelado: {
      color: "bg-red-100 text-red-800",
      label: "cancelado",
      dotColor: "bg-red-500",
    },
    pausado: {
      color: "bg-yellow-100 text-yellow-800",
      label: "pendiente",
      dotColor: "bg-yellow-600",
    },
  };
  return (
    <>
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripcion
            </th>

            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Progreso
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredProjects.map((project) => (
            <tr key={project.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{project.title}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {project.descripcion}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {(() => {
                  // Mapear status de la DB a las claves de statusConfig
                  const mapStatusKey = (status: string) => {
                    switch (status.toLowerCase()) {
                      case "en progreso":
                        return "en_progreso";
                      case "terminado":
                        return "terminado";
                      case "cancelado":
                        return "cancelado";
                      case "pausado":
                        return "pausado";
                      default:
                        return undefined;
                    }
                  };

                  const statusKey = mapStatusKey(project.status);

                  return (
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        statusKey
                          ? statusConfig[statusKey].color
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          statusKey
                            ? statusConfig[statusKey].dotColor
                            : "bg-gray-600"
                        }`}
                      ></span>
                      {statusKey
                        ? statusConfig[statusKey].label
                        : "Desconocido"}
                    </span>
                  );
                })()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(project.created_at).toLocaleDateString("es-AR")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {project.progress ? `${project.progress}%` : "0%"}
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => handleView(project)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron Proyectos
        </div>
      )}
      {viewModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900 border-b pb-2">
              Editar Proyecto
            </h2>

            {errorForm && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errorForm}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                Cambios guardados correctamente
              </div>
            )}

            <form onSubmit={handleNewDocument} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Título
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  type="text"
                  id="title"
                  name="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                  placeholder="Ej: Documento principal"
                />
              </div>

              <div>
                <label
                  htmlFor="documentUrl"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  URL del Documento
                </label>
                <input
                  value={documentUrl}
                  onChange={(e) => setDocumentUrl(e.target.value)}
                  type="text"
                  id="documentUrl"
                  name="documentUrl"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría del Documento
                </label>
                <select
                  value={categoryDocument}
                  onChange={(e) => setCategoryDocument(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 bg-white"
                >
                  <option value="">Seleccionar...</option>
                  <option value="Diseño">Diseño</option>
                  <option value="Contractual">Contractual</option>
                  <option value="Reuniones">Reuniones</option>
                  <option value="Técnico">Técnico</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="typeDocument"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Tipo de Documento
                </label>
                <input
                  value={typeDocument}
                  onChange={(e) => setTypeDocument(e.target.value)}
                  type="text"
                  id="typeDocument"
                  name="typeDocument"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
                  placeholder="Ej: PDF, Imagen, Contrato..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors duration-150 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                }`}
              >
                {loading ? "Actualizando..." : "Asignar Documento"}
              </button>
            </form>

            <button
              onClick={() => setViewModal(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 cursor-pointer transition-colors duration-150"
            >
              Cerrar
            </button>

            {selectedProject.documents?.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="font-semibold mb-2 text-gray-800">
                  Documentos asignados:
                </h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  {selectedProject.documents.map((doc) => (
                    <li key={doc.id}>
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {doc.title}
                      </a>{" "}
                      <span className="text-gray-500">
                        ({doc.category_document})
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
