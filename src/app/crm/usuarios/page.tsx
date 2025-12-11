"use client";

import { useEffect, useState } from "react";
import { useProfiles } from "@/hooks/admin/useProfiles";

import { Calendar, DollarSign, FileText, Plus, Search } from "lucide-react";
import ClientsTable from "./components/Clientstable";
import CreateAccountModal from "./components/Createaccountmodal";
import { useRoles, useUserRolProfiles } from "@/hooks/admin/useRoles";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

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
  presupuesto?: {
    id: string;
    monto: number;
    estado: string;
    divisa: string;
    created_at: string;
    cash_collected: number;
    presupuestos_employees?: {
      profiles: {
        id: string;
        nombre: string;
      };
    }[];
  } | null;
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
const formatCurrency = (monto: number, divisa: string) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: divisa || "USD",
    minimumFractionDigits: 0,
  }).format(monto);
};
const allowedRoles = ["CEO", "COO", "Sales manager", "QA"];
export default function ClientsPageUnsafe() {
  const { roleAdmin } = useAuth();
  const router = useRouter();
  const { isLoading: loadingRoles, isError: errorRoles } = useRoles();
  const { isLoading: loadingUsers, isError: errorUsers } = useUserRolProfiles();
  const {
    data: dataProfiles = [],
    isLoading: isLoadingProfiles,
    error: errorProfiles,
    refetch: refetchProfiles,
  } = useProfiles();
  // Estados de selección
  // Estados de modales
  const [showModal, setShowModal] = useState(false);
  // Estados de búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState("");
  const [selectedEstado, setSelectedEstado] = useState("");
  const [selectedBudgetEstado, setSelectedBudgetEstado] = useState("");
  const [montoDesde, setMontoDesde] = useState(0);
  const [montoHasta, setMontoHasta] = useState(0);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (roleAdmin) {
      if (roleAdmin === "Diseñador" || roleAdmin === "Desarrollador") {
        router.replace("/crm/proyectos");
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
  if (isLoadingProfiles) return <div>Cargando clientes...</div>;
  if (errorProfiles) return <div>Error: {errorProfiles.message}</div>;
  const normalizedProfiles = dataProfiles.map((client: Client) => {
    const proyectos = client.projects || [];

    const isActivo = proyectos.some((p) => p.status === "En progreso");
    const isInactivo = proyectos.some((p) => p.status === "Pausado");

    let estado: "Activo" | "Inactivo" | "Sin proyectos" = "Sin proyectos";

    if (isActivo) {
      estado = "Activo";
    } else if (isInactivo) {
      estado = "Inactivo";
    }

    return {
      ...client,
      estado,
      budgets:
        client.projects
          ?.map((p) => p.presupuesto)
          .filter((b) => b !== null && b !== undefined) || [],
    };
  });

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

    const matchesBudgetEstado =
      selectedBudgetEstado === "" ||
      profile.budgets.some((b) => b.estado === selectedBudgetEstado);

    const matchesMonto =
      (montoDesde === 0 && montoHasta === 0) ||
      profile.budgets.some((b) => {
        const monto = b.monto || 0;
        return (
          (montoDesde === 0 || monto >= montoDesde) &&
          (montoHasta === 0 || monto <= montoHasta)
        );
      });

    const matchesFechaPresupuesto =
      (fechaDesde === "" && fechaHasta === "") ||
      profile.budgets.some((b) => {
        const fechaCreacion = new Date(b.created_at);
        const desde = fechaDesde ? new Date(fechaDesde) : null;
        const hasta = fechaHasta ? new Date(fechaHasta + "T23:59:59") : null;
        return (
          (!desde || fechaCreacion >= desde) &&
          (!hasta || fechaCreacion <= hasta)
        );
      });

    return (
      matchesSearch &&
      matchesTipo &&
      matchesEstado &&
      matchesBudgetEstado &&
      matchesMonto &&
      matchesFechaPresupuesto
    );
  });

  const allBudgets = normalizedProfiles.flatMap((a) => a.budgets);

  const totalByStatus = (estado: string, divisa?: string) => {
    return allBudgets
      .filter((b) => b.estado === estado && (!divisa || b.divisa === divisa))
      .reduce((sum, b) => sum + (b.monto || 0), 0);
  };

  const totalPresentado = allBudgets.reduce(
    (sum, b) => sum + (b.monto || 0),
    0
  );
  const totalSinPresentar = allBudgets.filter(
    (b) => b.estado === "Sin presentar"
  ).length;
  const totalAceptado = totalByStatus("Aceptado", "USD");
  const totalRevision = totalByStatus("En revisión", "USD");
  const totalRechazados = allBudgets.filter(
    (b) => b.estado === "Rechazado"
  ).length;

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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sin Presentar</p>
                <p className="text-2xl font-bold text-gray-600 mt-1">
                  {totalSinPresentar}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Presentado</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {formatCurrency(totalPresentado, "USD")}
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
                  {formatCurrency(totalAceptado, "USD")}
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
                  {formatCurrency(totalRevision, "USD")}
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
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {totalRechazados}
                </p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <FileText className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Acciones y búsqueda */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* 🔍 BUSCADOR */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Buscar usuario:
            </label>
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
          </div>

          {/* 👤 FILTRO POR TIPO */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Filtrar por rol:
            </label>
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los usuarios</option>
              <option value="Cliente">Cliente</option>
              <option value="Lead">Lead</option>
            </select>
          </div>

          {/* ✅ FILTRO POR ESTADO */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Filtrar por estado:
            </label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Cualquier estado</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Sin proyectos">Sin proyectos</option>
            </select>
          </div>

          {/* 💰 FILTRO POR ESTADO DE PRESUPUESTO */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Estado del presupuesto:
            </label>
            <select
              value={selectedBudgetEstado}
              onChange={(e) => setSelectedBudgetEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos los presupuestos</option>
              <option value="Sin presentar">Sin presentar</option>
              <option value="Aceptado">Aceptado</option>
              <option value="En revisión">En revisión</option>
              <option value="Rechazado">Rechazado</option>
            </select>
          </div>

          {/* 📊 FILTRO POR MONTO */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Rango de monto:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Desde"
                value={montoDesde}
                onChange={(e) => setMontoDesde(Number(e.target.value))}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Hasta"
                value={montoHasta}
                onChange={(e) => setMontoHasta(Number(e.target.value))}
                className="w-28 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          {/* 📅 FILTRO POR FECHA DE PRESUPUESTO */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600 mb-1">
              Fecha de presupuesto:
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-gray-500">-</span>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          {/* ➕ BOTÓN CREAR CUENTA */}
          <div className="flex flex-col sm:self-end">
            <label className="text-sm font-medium text-transparent mb-1">
              .
            </label>{" "}
            {/* Espacio para alinear */}
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Crear Cuenta de usuario
            </button>
          </div>
        </div>

        {/* Tabla de clientes */}
        <ClientsTable clients={filteredAccounts} />

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
