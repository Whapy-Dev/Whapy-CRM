"use client";

import { useState } from "react";
import { Plus, Search, AlertCircle, CheckCircle } from "lucide-react";
import { useProfiles } from "@/hooks/admin/useProfiles";
import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useLeads } from "@/hooks/admin/useLeads";

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
};
export type Lead = {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  empresa?: string | null;
  ciudad?: string | null;
  codigoPostal?: string | null;
  created_at?: string;
  status?: string;
  notes?: string | null;
  created_by?: string;
  projects?: Project[];
};

type InsertData = {
  project_id: string;
  title: string;
  document_url: string;
  category_document: string;
  type_document: string;
  user_id?: string;
  lead_id?: string;
};
type InsertMeetingData = {
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
  const {
    data: dataLeads = [],
    isLoading: isLoadingLeads,
    error: errorLeads,
    refetch: refetchLeads,
  } = useLeads();

  const normalizedLeads = dataLeads.map((lead: Lead) => {
    const proyectos = lead.projects || [];

    const isActivo = proyectos.some((p) => p.status === "En progreso");
    const isInactivo = proyectos.some((p) => p.status === "Pausado");

    let estado: "Activo" | "Inactivo" | "Sin proyectos" = "Sin proyectos";
    if (isActivo) estado = "Activo";
    else if (isInactivo) estado = "Inactivo";

    return {
      id: lead.id,
      nombre: lead.name,
      email: lead.email,
      telefono: lead.phone,
      empresa: lead.empresa || "—",
      ciudad: lead.ciudad || "—",
      codigoPostal: lead.codigoPostal || "—",
      created_at: lead.created_at,
      tipo: "Lead" as const,
      projects: proyectos,
      estado,
    };
  });

  const normalizedClients = dataProfiles.map((client: Client) => {
    const proyectos = client.projects || [];

    const isActivo = proyectos.some((p) => p.status === "En progreso");
    const isInactivo = proyectos.some((p) => p.status === "Pausado");

    let estado: "Activo" | "Inactivo" | "Sin proyectos" = "Sin proyectos";
    if (isActivo) estado = "Activo";
    else if (isInactivo) estado = "Inactivo";

    return {
      ...client,
      tipo: "Cliente" as const,
      estado,
    };
  });

  const allAccounts = [...normalizedClients, ...normalizedLeads];

  type Account =
    | (Client & { tipo: "Cliente" })
    | (Lead & {
        tipo: "Lead";
        estado: "Activo" | "Inactivo" | "Sin proyectos";
      });
  const [selectedClient, setSelectedClient] = useState<Account | null>(null);

  function isClient(account: Account): account is Client & { tipo: "Cliente" } {
    return account.tipo === "Cliente";
  }

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showMeetingModal, setShowMeetingModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [telefonoInput, setTelefonoInput] = useState("");
  const [empresaInput, setEmpresaInput] = useState("");
  const [ciudadInput, setCiudadInput] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorForm("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
          nombre: nameInput,
          telefono: telefonoInput,
          empresa: empresaInput,
          ciudad: ciudadInput,
          codigoPostal: codigoPostal,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");

      setSuccessMessage(`Usuario creado: ${data.user.email}`);
      setEmailInput("");
      setPasswordInput("");
      setNameInput("");
    } catch (err: unknown) {
      console.log(err);

      if (err instanceof Error) {
        setErrorForm(err.message);
      } else {
        setErrorForm("Ocurrió un error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");
  const [categoryDocument, setCategoryDocument] = useState("");
  const [typeDocument, setTypeDocument] = useState("");
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [errorFormDocument, setErrorFormDocument] = useState("");
  const [successDocument, setSuccessDocument] = useState(false);
  const supabase = createClient();
  const handleNewDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedClient) return;
    if (!title || !documentUrl || !categoryDocument || !typeDocument) {
      setErrorFormDocument("Completa todos los campos antes de guardar");
      setLoadingDocument(false);
      return;
    }
    setLoadingDocument(true);
    setErrorFormDocument("");
    setSuccessDocument(false);

    const insertData: InsertData = {
      project_id: selectedProject.id,
      title: title,
      document_url: documentUrl,
      category_document: categoryDocument,
      type_document: typeDocument,
    };

    if (selectedClient.tipo === "Lead") {
      insertData.lead_id = selectedClient.id;
    } else {
      insertData.user_id = selectedClient.id;
    }

    const { error } = await supabase.from("documents").insert(insertData);
    await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    await queryClient.invalidateQueries({ queryKey: ["leads"] });
    if (error) {
      console.error(error);
      setErrorFormDocument("Error al asignar documento");
    } else {
      setSuccessDocument(true);
      await refetchProfiles();
      await refetchLeads();
      setTitle("");
      setDocumentUrl("");
      setCategoryDocument("");
      setTypeDocument("");
      setTimeout(() => {
        setShowDocumentModal(false);
        setSuccessDocument(false);
      }, 1000);
    }

    setLoadingDocument(false);
  };

  const [titleMeeting, setTitleMeeting] = useState("");
  const [startAtMeeting, setStartAtMeeting] = useState("");
  const [location, setLocation] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [summaryMd, setSummaryMd] = useState("");
  const [summaryPdfUrl, setSummaryPdfUrl] = useState("");
  const [typeMeeting, setTypeMeeting] = useState("");
  const [estado, setEstado] = useState("");
  const [duration, setDuration] = useState("");
  const [errorFormMeeting, setErrorFormMeeting] = useState("");
  const [successMeeting, setSuccessMeeting] = useState(false);

  const handleNewMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !selectedClient) return;

    if (
      !titleMeeting ||
      !location ||
      !meetUrl ||
      !summaryPdfUrl ||
      !typeMeeting ||
      !estado ||
      !duration
    ) {
      setErrorFormMeeting("Completa todos los campos antes de guardar");
      return;
    }

    setErrorFormMeeting("");
    setSuccessMeeting(false);

    const insertData: InsertMeetingData = {
      project_id: selectedProject.id,
      title: titleMeeting,
      start_at: startAtMeeting,
      location: location,
      meet_url: meetUrl,
      summary_md: summaryMd,
      summary_pdf_url: summaryPdfUrl,
      type_meeting: typeMeeting,
      estado: estado,
      duration: duration,
    };

    if (selectedClient.tipo === "Lead") {
      insertData.lead_id = selectedClient.id;
    } else {
      insertData.user_id = selectedClient.id;
    }

    const { error } = await supabase.from("all_meetings").insert(insertData);
    await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    await queryClient.invalidateQueries({ queryKey: ["leads"] });
    if (error) {
      console.error(error);
      setErrorFormMeeting("Error al asignar reunión");
    } else {
      setSuccessMeeting(true);
      await refetchProfiles();
      await refetchLeads();
      setTitleMeeting("");
      setStartAtMeeting("");
      setLocation("");
      setMeetUrl("");
      setSummaryMd("");
      setSummaryPdfUrl("");
      setTypeMeeting("");
      setEstado("");
      setDuration("");
      setTimeout(() => {
        setShowMeetingModal(false);
        setSuccessMeeting(false);
      }, 1000);
    }
  };

  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const term = searchTerm.toLowerCase();
  const filteredAccounts = allAccounts.filter((account) => {
    const matchesSearch =
      (account.nombre?.toLowerCase() || "").includes(term) ||
      (account.email?.toLowerCase() || "").includes(term) ||
      (account.telefono?.toLowerCase() || "").includes(term);

    const matchesTipo =
      selectedTipo === "" ||
      account.tipo.toLowerCase() === selectedTipo.toLowerCase();

    const matchesEstado =
      selectedEstado === "" ||
      account.estado.toLowerCase() === selectedEstado.toLowerCase();

    return matchesSearch && matchesTipo && matchesEstado;
  });

  if (isLoadingProfiles) return <div>Cargando clientes...</div>;
  if (errorProfiles) return <div>Error: {errorProfiles.message}</div>;
  if (isLoadingLeads) return <div>Cargando leads...</div>;
  if (errorLeads) return <div>Error: {errorLeads.message}</div>;
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
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
            placeholder="Buscar clientes..."
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
          <option value="">Todas las cuentas</option>
          <option value="Cliente">Cliente</option>
          <option value="Lead">Lead</option>
        </select>

        <select
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
          className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tipo de Cliente</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
          <option value="Sin proyectos">Sin proyectos</option>
        </select>

        <button
          onClick={() => {
            setEmailInput("");
            setPasswordInput("");
            setNameInput("");
            setShowModal(true);
            setErrorForm("");
            setSuccessMessage("");
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Crear Cuenta de Cliente
        </button>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredAccounts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ciudad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Codigo Postal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fecha de creación
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAccounts.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedClient(client);

                      setShowClientModal(true);
                    }}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {client.nombre || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.telefono || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.empresa || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.ciudad || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.codigoPostal || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {client.tipo || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          client.estado === "Activo"
                            ? "bg-green-100 text-green-700"
                            : client.estado === "Inactivo"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {client.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {client.created_at
                        ? new Date(client.created_at).toLocaleDateString(
                            "es-AR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            No se encontraron clientes
          </div>
        )}
      </div>
      {/* Modal Crear Cuenta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Crear cuenta de cliente</h2>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              {errorForm && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{errorForm}</p>
                </div>
              )}

              {successMessage && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800 whitespace-pre-line">
                    {successMessage}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre (opcional)
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Juan Pérez"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono
                </label>
                <input
                  type="text"
                  value={telefonoInput}
                  onChange={(e) => setTelefonoInput(e.target.value)}
                  placeholder="+54 9 11 23211123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  value={empresaInput}
                  onChange={(e) => setEmpresaInput(e.target.value)}
                  placeholder="SolutionsTeam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={ciudadInput}
                  onChange={(e) => setCiudadInput(e.target.value)}
                  placeholder="Jose C. Páz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codigo Postal
                </label>
                <input
                  type="text"
                  value={codigoPostal}
                  onChange={(e) => setCodigoPostal(e.target.value)}
                  placeholder="3107"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta contraseña es temporal. El cliente debería cambiarla
                  después del primer login.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${
                    loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading ? "Creando..." : "Crear Cuenta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showClientModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh] shadow-2xl border border-gray-200">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              {selectedClient
                ? "nombre" in selectedClient
                  ? selectedClient.nombre
                  : selectedClient.name
                : "—"}
            </h2>

            {/* Card Datos Personales */}
            <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-md border border-blue-200">
              <h3 className="text-xl font-semibold mb-4 text-blue-700">
                Datos Personales
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
                <p>
                  <strong>Email:</strong> {selectedClient.email}
                </p>
                <p>
                  <strong>Teléfono:</strong>{" "}
                  {selectedClient
                    ? "telefono" in selectedClient
                      ? selectedClient.telefono
                      : selectedClient.phone
                    : "—"}
                </p>
                <p>
                  <strong>Empresa:</strong> {selectedClient.empresa || "—"}
                </p>
                <p>
                  <strong>Ciudad:</strong> {selectedClient.ciudad || "—"}
                </p>
                <p>
                  <strong>Código Postal:</strong>{" "}
                  {selectedClient.codigoPostal || "—"}
                </p>
              </div>
            </div>

            {/* Proyectos */}
            <h3 className="text-2xl font-semibold mb-4 text-gray-900">
              Proyectos
            </h3>
            {selectedClient.projects?.length ? (
              <div className="space-y-6">
                {selectedClient.projects.map((project: Project) => {
                  let statusColor = "bg-gray-100 text-gray-800";
                  if (project.status === "En progreso")
                    statusColor = "bg-yellow-100 text-yellow-800";
                  if (project.status === "Terminado")
                    statusColor = "bg-green-100 text-green-800";
                  if (project.status === "Cancelado")
                    statusColor = "bg-red-100 text-red-800";

                  return (
                    <div
                      key={project.id}
                      className="p-6 rounded-2xl shadow-md border border-gray-200 bg-gradient-to-r from-white to-gray-50"
                    >
                      <div
                        className={`px-4 py-1 inline-block rounded-full mb-3 ${statusColor} font-semibold`}
                      >
                        {project.status}
                      </div>
                      <h4 className="text-lg font-semibold mb-2">
                        {project.title}{" "}
                        <span className="text-sm text-gray-500 font-normal">
                          {project.progress}%
                        </span>
                      </h4>
                      <p className="mb-4 text-gray-700">
                        {project.descripcion}
                      </p>

                      {/* Documentos */}
                      <div className="mb-4 p-4 bg-blue-50 rounded-xl shadow-inner border border-blue-100">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-semibold text-blue-700">
                            Documentos
                          </h5>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setShowDocumentModal(true);
                            }}
                            className="px-2 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
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

                      {/* --- Reuniones --- */}
                      <div className="p-4 bg-green-50 rounded-xl shadow-inner border border-green-100">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-semibold text-green-700">
                            Reuniones
                          </h5>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setShowMeetingModal(true);
                            }}
                            className="px-2 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
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
                })}
              </div>
            ) : (
              <p className="text-gray-500">No tiene proyectos</p>
            )}

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowClientModal(false)}
                className="px-6 py-2 bg-gray-300 rounded-2xl hover:bg-gray-400 font-medium cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/** Modal Asignar Documento **/}
      {showDocumentModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
            <h3 className="text-xl font-bold mb-4">
              Asignar Documento a {selectedProject.title}
            </h3>
            {errorFormDocument && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errorFormDocument}</p>
              </div>
            )}

            {successDocument && (
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
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDocumentModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg font-medium duration-150 hover:bg-gray-400 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loadingDocument}
                  className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors duration-150 ${
                    loadingDocument
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                  }`}
                >
                  {loadingDocument ? "Actualizando..." : "Asignar Documento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/** Modal Asignar Reunión **/}
      {showMeetingModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
            <h3 className="text-xl font-bold mb-4">
              Asignar Reunión a {selectedProject.title}
            </h3>
            {successMeeting && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                Cambios guardados correctamente
              </div>
            )}
            {errorFormMeeting && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                {errorFormMeeting}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleNewMeeting}>
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={titleMeeting}
                  onChange={(e) => setTitleMeeting(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Fecha/Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y hora
                </label>
                <input
                  type="datetime-local"
                  value={startAtMeeting}
                  onChange={(e) => setStartAtMeeting(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* URL de la reunión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de la reunión
                </label>
                <input
                  type="text"
                  value={meetUrl}
                  onChange={(e) => setMeetUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Resumen en Markdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resumen (Markdown)
                </label>
                <textarea
                  value={summaryMd}
                  onChange={(e) => setSummaryMd(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Opcional"
                />
              </div>

              {/* URL PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del resumen en PDF
                </label>
                <input
                  type="text"
                  value={summaryPdfUrl}
                  onChange={(e) => setSummaryPdfUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Tipo de reunión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de reunión
                </label>
                <input
                  type="text"
                  value={typeMeeting}
                  onChange={(e) => setTypeMeeting(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                  required
                >
                  <option value="">Seleccionar...</option>
                  <option value="programada">Programada</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>

              {/* Duración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duración (minutos)
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMeetingModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-2xl hover:bg-gray-400 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 cursor-pointer"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
