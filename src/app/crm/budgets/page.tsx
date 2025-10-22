"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Calendar,
  Eye,
  AlertCircle,
  Currency,
} from "lucide-react";
import { useBudgets } from "@/hooks/useBudgets";
import { useLeads } from "@/hooks/useLeads";
import { createClient } from "@/lib/supabase/client";

type Budget = {
  id: string;
  title: string;
  amount_total: number;
  status: "en revision" | "presentado" | "aceptado" | "rechazado";
  currency: string;
  pdf_url: string;
  created_at: string;
  leads: {
    name: string;
    created_at: string;
  };
};
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function BudgetsPage() {
  const {
    data: budgets = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useBudgets();
  const { data: leads = [] } = useLeads();
  const [viewCreatePresupuesto, setViewCreatePresupuesto] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredBudgets = budgets.filter((budget) =>
    budget.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalByStatus = (status: Budget["status"]) => {
    return budgets
      .filter((b) => b.status === status)
      .reduce((sum, b) => sum + b.amount_total, 0);
  };

  const [idLead, setIdLead] = useState("");
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [amountTotal, setAmountTotal] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [currency, setCurrency] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNewPresupuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm("");
    setLoading(true);
    setSuccess(false);

    try {
      const supabase = createClient();

      // Validaciones básicas
      if (!idLead || !title || !amountTotal || !status) {
        setErrorForm("Por favor, completa todos los campos obligatorios.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("budgets").insert([
        {
          lead_id: idLead,
          title: title,
          status: status,
          amount_total: Number(amountTotal),
          pdf_url: pdfUrl || null,
          currency: currency || "USD",
        },
      ]);

      if (error) {
        console.error(error);
        setErrorForm("Error al crear presupuesto");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      setIdLead("");
      setStatus("");
      setTitle("");
      setAmountTotal("");
      setPdfUrl("");
      setCurrency("");
    } catch (err) {
      console.error("Error al crear nuevo Presupuesto:", err);
      setErrorForm("Ocurrió un error inesperado. Intenta nuevamente.");
      setLoading(false);
    }
  };
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Presupuestos</h1>
        <p className="mt-2 text-gray-600">
          Gestiona y realiza seguimiento de todos tus presupuestos
        </p>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Presentado</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalByStatus("presentado"))}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Aceptado</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {formatCurrency(totalByStatus("aceptado"))}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Revisión</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {formatCurrency(totalByStatus("en revision"))}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rechazados</p>
              <p className="text-2xl font-bold text-gray-600 mt-1">
                {budgets.filter((b) => b.status === "rechazado").length}
              </p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <FileText className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Acciones y búsqueda */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar presupuestos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-5">
          <button
            type="button"
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            Actualizar Presupuestos
          </button>
          <button
            type="button"
            onClick={() => setViewCreatePresupuesto(!viewCreatePresupuesto)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nuevo Presupuesto
          </button>
        </div>
      </div>

      {/* ✅ Tabla de presupuestos */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <BudgetsTable filteredBudgets={filteredBudgets} />
      </div>

      {/* ✅ Modal de creación */}
      {viewCreatePresupuesto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nuevo Presupuesto</h2>
            <form onSubmit={handleNewPresupuesto} className="space-y-4">
              {/* Error */}
              {errorForm && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{errorForm}</p>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    Presupuesto creado con éxito
                  </p>
                </div>
              )}

              {/* Lead */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lead
                </label>
                <select
                  value={idLead}
                  onChange={(e) => setIdLead(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un lead</option>
                  {leads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Presupuesto web corporativa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona estado</option>
                  <option value="draft">draft</option>
                  <option value="presentado">presentado</option>
                  <option value="aceptado">aceptado</option>
                  <option value="rechazado">rechazado</option>
                </select>
              </div>

              {/* Monto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto total
                </label>
                <input
                  type="number"
                  value={amountTotal}
                  onChange={(e) => setAmountTotal(e.target.value)}
                  placeholder="3000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL del PDF (opcional)
                </label>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://tuarchivo.pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Moneda */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Moneda (opcional)
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="USD"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setViewCreatePresupuesto(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                    loading ? "cursor-not-allowed" : "cursor-pointer"
                  }`}
                >
                  {loading ? "Creando..." : "Crear Presupuesto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function BudgetsTable({ filteredBudgets }: { filteredBudgets: Budget[] }) {
    const [viewModal, setViewModal] = useState(false);
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

    const [pdfUrl, setPdfUrl] = useState("");
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorForm, setErrorForm] = useState("");
    const [success, setSuccess] = useState(false);

    const supabase = createClient();

    const handleView = (budget: Budget) => {
      setSelectedBudget(budget);
      setPdfUrl(budget.pdf_url || "");
      setStatus(budget.status);
      setViewModal(true);
    };

    // 👉 Actualizar URL del PDF
    const handleUpdatePDF = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedBudget) return;
      setLoading(true);
      setErrorForm("");
      setSuccess(false);

      const { error } = await supabase
        .from("budgets")
        .update({ pdf_url: pdfUrl })
        .eq("id", selectedBudget.id);

      if (error) {
        console.error(error);
        setErrorForm("Error al actualizar la URL del PDF");
      } else {
        setSuccess(true);
      }

      setLoading(false);
    };

    // 👉 Actualizar estado
    const handleUpdateStatus = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedBudget) return;
      setLoading(true);
      setErrorForm("");
      setSuccess(false);

      const { error } = await supabase
        .from("budgets")
        .update({ status })
        .eq("id", selectedBudget.id);

      if (error) {
        console.error(error);
        setErrorForm("Error al actualizar el estado");
      } else {
        setSuccess(true);
      }

      setLoading(false);
    };

    return (
      <>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente / Proyecto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Creación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Presentado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBudgets.map((budget) => (
              <tr key={budget.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">
                    {budget.title} / {budget.leads?.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-semibold text-gray-900">
                    {budget.currency} {formatCurrency(budget.amount_total)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      budget.status === "en revision"
                        ? "bg-gray-100 text-gray-800"
                        : budget.status === "presentado"
                        ? "bg-blue-100 text-blue-800"
                        : budget.status === "aceptado"
                        ? "bg-green-100 text-green-800"
                        : budget.status === "rechazado"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {budget.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(budget.created_at).toLocaleDateString("es-AR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {budget.leads?.created_at
                    ? new Date(budget.leads?.created_at).toLocaleDateString(
                        "es-AR"
                      )
                    : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    onClick={() => handleView(budget)}
                    className="inline-flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBudgets.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron presupuestos
          </div>
        )}

        {/* ✅ Modal de edición */}
        {viewModal && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-6">
              <h2 className="text-xl font-bold">Editar Presupuesto</h2>

              {/* Mensajes */}
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

              {/* Form 1: URL del PDF */}
              <form onSubmit={handleUpdatePDF} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  URL del PDF
                </label>
                <input
                  type="text"
                  value={pdfUrl}
                  onChange={(e) => setPdfUrl(e.target.value)}
                  placeholder="https://miarchivo.pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                >
                  {loading ? "Actualizando..." : "Actualizar PDF"}
                </button>
              </form>

              {/* Form 2: Estado */}
              <form onSubmit={handleUpdateStatus} className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Estado
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="en revision">en revision</option>
                  <option value="presentado">presentado</option>
                  <option value="aceptado">aceptado</option>
                  <option value="rechazado">rechazado</option>
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
}
