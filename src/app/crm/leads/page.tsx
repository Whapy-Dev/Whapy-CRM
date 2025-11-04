"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLeadsLead } from "@/hooks/admin/useLeads";

// Tipos
type LeadLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  empresa: string;
  status: "nuevo" | "contactado" | "agendado";
  source: string;
  created_at: string;
};

export default function LeadsPage() {
  const { data: leads = [], refetch } = useLeadsLead();

  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEmpresa, setFilterEmpresa] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const filteredLeads = leads.filter((lead) => {
    const name = lead.name?.toLowerCase() || "";
    const email = lead.email?.toLowerCase() || "";
    const empresa = lead.empresa?.toLowerCase() || "";
    const status = lead.status?.toLowerCase() || "";

    const term = searchTerm.toLowerCase();
    const empresaTerm = filterEmpresa.toLowerCase();
    const estadoTerm = filterEstado.toLowerCase();

    // Filtrar por nombre/email/empresa, empresa adicional y estado
    const matchesSearch = name.includes(term) || email.includes(term);
    const matchesEmpresa = empresa.includes(empresaTerm);
    const matchesEstado = estadoTerm ? status === estadoTerm : true;

    return matchesSearch && matchesEmpresa && matchesEstado;
  });

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNewLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm("");
    setLoading(true);
    setSuccess(false);
    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error(userError);
        setErrorForm("Error al obtener usuario");
        return;
      }

      if (!user) {
        setErrorForm("No hay usuario logeado");
        return;
      }

      if (!nombre || !email || !telefono || !empresa) {
        setErrorForm("Por favor completa todos los campos");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("leads").insert([
        {
          name: nombre,
          email: email,
          empresa: empresa,
          phone: telefono,
          status: "nuevo",
          created_by: user.id,
        },
      ]);

      if (error) {
        console.error(error);
        setErrorForm("Error al crear lead");
        return;
      }

      setLoading(false);
      setSuccess(true);
    } catch (err) {
      console.error("Error al crear nuevo Lead:", err);
      setErrorForm(
        "Ocurrió un error inesperado. Por favor, intenta nuevamente."
      );
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tus leads y conviértelos en clientes
        </p>
      </div>

      {/* Acciones y búsqueda */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          {/* Buscar leads */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtrar empresa */}
          <input
            type="text"
            placeholder="Filtrar por empresa..."
            value={filterEmpresa}
            onChange={(e) => setFilterEmpresa(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          {/* Filtrar estado */}
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Contactado">Contactado</option>
            <option value="Agendado">Agendado</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-4 h-4" />
            Filtrar
          </button>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Actualizar Leads
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Lead
          </button>
        </div>
      </div>

      {/* Tabla de Leads */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <LeadsTable filteredLeads={filteredLeads} />
      </div>

      {/* Modal Nuevo Lead */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Lead</h2>
            <form onSubmit={handleNewLead} className="space-y-4">
              {errorForm && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{errorForm}</p>
                </div>
              )}

              {success && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Lead creado con exito
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Juan Pérez"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="juan@ejemplo.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+54 9 11 1234-5678"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa
                </label>
                <input
                  type="text"
                  value={empresa}
                  onChange={(e) => setEmpresa(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tech Solutions"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                    loading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading ? "Cargando" : "Crear Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadsTable({ filteredLeads }: { filteredLeads: LeadLead[] }) {
  const [viewModal, setViewModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadLead | null>(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  // Abrir modal

  const handleView = (lead: LeadLead) => {
    setSelectedLead(lead);
    setStatus(lead.status);
    setViewModal(true);
  };

  // Actualizar estado del lead
  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setLoading(true);
    setErrorForm("");
    setSuccess(false);

    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", selectedLead.id);

    if (error) {
      console.error(error);
      setErrorForm("Error al actualizar el estado");
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  const statusColors = {
    nuevo: "bg-blue-100 text-blue-800",
    contactado: "bg-yellow-100 text-yellow-800",
    agendado: "bg-purple-100 text-purple-800",
    no_calificado: "bg-gray-100 text-gray-800",
    perdido: "bg-red-100 text-red-800",
    convertido: "bg-green-100 text-green-800",
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
              Contacto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Empresa
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredLeads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="font-medium text-gray-900">{lead.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    {lead.email}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    {lead.phone}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {lead.empresa}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    statusColors[lead.status]
                  }`}
                >
                  {lead.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(lead.created_at).toLocaleDateString("es-AR")}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <button
                  onClick={() => handleView(lead)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron leads
        </div>
      )}
      {viewModal && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-6">
            <h2 className="text-xl font-bold">Editar Lead</h2>

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

            <form onSubmit={handleUpdateStatus} className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Estado
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="nuevo">nuevo</option>
                <option value="contactado">contactado</option>
                <option value="agendado">agendado</option>
              </select>
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
              >
                {loading ? "Actualizando..." : "Actualizar Estado"}
              </button>
            </form>

            <button
              onClick={() => setViewModal(false)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
