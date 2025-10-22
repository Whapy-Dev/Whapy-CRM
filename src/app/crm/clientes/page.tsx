"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Mail, Phone, AlertCircle } from "lucide-react";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";

// Tipos
type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  empresa: string;
  status:
    | "nuevo"
    | "contactado"
    | "agendado"
    | "no_calificado"
    | "perdido"
    | "convertido";
  source: string;
  created_at: string;
};

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");

  const supabase = createSupabaseClient();

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setErrorForm("Email y contraseña son obligatorios");
      return;
    }

    setLoading(true);
    setErrorForm("");

    try {
      const { data: userData, error: userError } =
        await supabase.auth.admin.createUser({
          email: emailInput,
          password: passwordInput,
          email_confirm: true,
        });

      if (userError) throw userError;

      await supabase.from("profiles").insert({
        id: userData.user.id,
        must_change_password: true,
        role: "cliente",
      });

      alert(
        `Cuenta creada con éxito!\nEmail: ${emailInput}\nContraseña: ${passwordInput}`
      );
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setErrorForm("Error al crear la cuenta de cliente");
    } finally {
      setLoading(false);
    }
  };

  //   const filteredClients = clients.filter((c) =>
  //     c.name.toLowerCase().includes(searchTerm.toLowerCase())
  //   );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tus clientes y crea cuentas para ellos
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

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Actualizar Clientes
          </button>

          <button
            onClick={() => {
              setSelectedClient(null);
              setEmailInput("");
              setPasswordInput("");
              setShowModal(true);
              setErrorForm("");
            }}
            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm cursor-pointer"
          >
            Crear Cuenta
          </button>
        </div>
      </div>

      {errorForm && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {errorForm}
        </div>
      )}

      {/* Tabla de clientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* <ClientsTable filteredClients={filteredClients} /> */}
      </div>

      {/* Modal Crear Cuenta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Crear cuenta para usuario nuevo
            </h2>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              {errorForm && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{errorForm}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${
                    loading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading ? "Creando..." : "Crear Cuenta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Tabla de clientes
function ClientsTable({ filteredClients }: { filteredClients: Client[] }) {
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
      <table className="w-full table-auto">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-2">Nombre</th>
            <th className="text-left px-4 py-2">Contacto</th>
            <th className="text-left px-4 py-2">Empresa</th>
            <th className="text-left px-4 py-2">Estado</th>
            <th className="text-left px-4 py-2">Fecha</th>
            <th className="text-right px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredClients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50">
              <td className="px-4 py-2">{client.name}</td>
              <td className="px-4 py-2">
                <div className="flex flex-col gap-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {client.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {client.phone}
                  </div>
                </div>
              </td>
              <td className="px-4 py-2">{client.empresa}</td>
              <td className="px-4 py-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    statusColors[client.status]
                  }`}
                >
                  {client.status}
                </span>
              </td>
              <td className="px-4 py-2">
                {new Date(client.created_at).toLocaleDateString("es-AR")}
              </td>
              <td className="px-4 py-2 text-right"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No se encontraron clientes
        </div>
      )}
    </>
  );
}
