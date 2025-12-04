"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  FileText,
  DollarSign,
  Calendar,
  Eye,
  AlertCircle,
} from "lucide-react";
import { usePresupuestos } from "@/hooks/admin/useBudgets";
import { createClient } from "@/lib/supabase/client";
import { useProfiles } from "@/hooks/admin/useProfiles";
import { useRoles, useUserRolProfiles } from "@/hooks/admin/useRoles";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

type Budget = {
  id: string;
  divisa: string;
  monto: number;
  estado: "En revisión" | "Aceptado" | "Rechazado" | "Presentado";
  project_id: string;
  created_at: string;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(amount);
};
const allowedRoles = ["CEO", "COO", "QA"];
export default function BudgetsPage() {
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
  const { data: budgets = [], refetch } = usePresupuestos();
  const { data: clients = [] } = useProfiles();
  const [viewCreatePresupuesto, setViewCreatePresupuesto] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterAmount, setFilterAmount] = useState("");
  const [idClient, setIdClient] = useState("");
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [amountTotal, setAmountTotal] = useState("");
  const [duracionEstimada, setDuracionEstimada] = useState("");
  const [modalidadPago, setModalidadPago] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [currency, setCurrency] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  useEffect(() => {
    if (roleAdmin) {
      if (roleAdmin === "Diseñador" || roleAdmin === "Desarrollador") {
        router.replace("/crm/proyectos");
        return;
      }
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

  const filteredBudgets = budgets.filter((budget) => {
    const statusMatch = filterStatus ? budget.estado === filterStatus : true;

    const amountMatch = filterAmount
      ? budget.monto === Number(filterAmount)
      : true;

    return statusMatch && amountMatch;
  });

  const totalByStatus = (status: Budget["estado"]) => {
    return budgets
      .filter((b) => b.estado === status)
      .reduce((sum, b) => sum + b.monto, 0);
  };

  const handleNewPresupuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm("");
    setLoading(true);
    setSuccess(false);

    try {
      const supabase = createClient();

      // Validaciones básicas
      if (
        !idClient ||
        !title ||
        !amountTotal ||
        !status ||
        !duracionEstimada ||
        !modalidadPago
      ) {
        setErrorForm("Por favor, completa todos los campos obligatorios.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("budgets").insert([
        {
          user_id: idClient,
          title: title,
          status: status,
          amount_total: Number(amountTotal),
          duracion_estimada: duracionEstimada,
          modadalidad_pago: modalidadPago,
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

      setIdClient("");
      setStatus("");
      setTitle("");
      setAmountTotal("");
      setDuracionEstimada("");
      setModalidadPago("");
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
                {formatCurrency(totalByStatus("Presentado"))}
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
                {formatCurrency(totalByStatus("Aceptado"))}
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
                {formatCurrency(totalByStatus("En revisión"))}
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
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          {/* Filtrar por título */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por título..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtrar por estado */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="en revision">En revisión</option>
            <option value="presentado">Presentado</option>
            <option value="aceptado">Aceptado</option>
            <option value="rechazado">Rechazado</option>
          </select>

          {/* Filtrar por amount_total */}
          <input
            type="number"
            placeholder="Filtrar por monto total..."
            value={filterAmount}
            onChange={(e) => setFilterAmount(e.target.value)}
            className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <select
                  value={idClient}
                  onChange={(e) => setIdClient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.nombre}
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
                  <option value="en revision">en revision</option>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duracion Estimada
                </label>
                <input
                  type="text"
                  value={duracionEstimada}
                  onChange={(e) => setDuracionEstimada(e.target.value)}
                  placeholder="2-3 semanas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modalidad de Pago
                </label>
                <input
                  type="text"
                  value={modalidadPago}
                  onChange={(e) => setModalidadPago(e.target.value)}
                  placeholder="6 cuotas"
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
}
