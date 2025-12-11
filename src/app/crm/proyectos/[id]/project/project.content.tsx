"use client";

import { useState } from "react";
import { Project } from "@/utils/types";
import Link from "next/link";
import {
  ArrowLeft,
  Settings,
  Check,
  Plus,
  Download,
  LayoutGrid,
  FileText,
  GitCommit,
  ListChecks,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Clock,
  LucideIcon,
  X,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ============ TYPES ============
type TabType = "checklist" | "kanban" | "files" | "commits";
type TaskStatus = "pendiente" | "en_progreso" | "completada" | "bloqueada";
type PhaseStatus = "pendiente" | "en_progreso" | "completada";

type PhaseTask = {
  id: string;
  titulo: string;
  descripcion: string | null;
  estado: TaskStatus;
  orden: number;
  fecha_limite: string | null;
  assigned: { id: string; nombre: string } | null;
};

type ProjectPhase = {
  id: string;
  nombre: string;
  descripcion: string | null;
  estado: PhaseStatus;
  orden: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  phase_tasks: PhaseTask[];
};

type TeamMember = {
  id: string;
  nombre: string;
  rol: string | null;
};

// ============ UTILS ============
const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "-";
  // Agregar T12:00:00 para evitar problemas de timezone
  const dateWithTime = dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00`;
  return new Date(dateWithTime).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });
};

const getStatusBadgeClasses = (estado: string) => {
  const classes: Record<string, string> = {
    completada: "bg-green-100 text-green-800",
    en_progreso: "bg-indigo-100 text-indigo-800",
    pendiente: "bg-slate-100 text-slate-600",
    bloqueada: "bg-red-100 text-red-800",
  };
  return classes[estado] || "bg-slate-100 text-slate-600";
};

const getStatusLabel = (estado: string) => {
  const labels: Record<string, string> = {
    completada: "Completado",
    en_progreso: "En Progreso",
    pendiente: "Pendiente",
    bloqueada: "Bloqueada",
  };
  return labels[estado] || estado;
};

const avatarUrl = (name: string, bg = "c7d2fe", color = "3730a3", size = 32) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=${bg}&color=${color}&size=${size}`;

// ============ SHARED COMPONENTS ============
function Avatar({
  name,
  size = "md",
  variant = "default",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "client";
}) {
  const sizes = { sm: "h-5 w-5", md: "h-6 w-6", lg: "h-8 w-8" };
  const apiSizes = { sm: 20, md: 24, lg: 32 };
  const colors =
    variant === "client" ? ["fde68a", "92400e"] : ["c7d2fe", "3730a3"];

  return (
    <img
      src={avatarUrl(name, colors[0], colors[1], apiSizes[size])}
      className={`${sizes[size]} rounded-full`}
      alt={name}
      title={name}
    />
  );
}

function StatusBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "sm" | "md";
}) {
  const sizeClasses =
    size === "sm" ? "text-xs px-1.5 py-0.5" : "text-xs px-2 py-1";
  return (
    <span
      className={`font-semibold rounded ${sizeClasses} ${getStatusBadgeClasses(
        status
      )}`}
    >
      {getStatusLabel(status)}
    </span>
  );
}

function ProgressBar({
  progress,
  label,
  sublabel,
}: {
  progress: number;
  label: string;
  sublabel?: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-slate-800">{label}</h3>
        <span className="text-indigo-600 font-bold text-lg">{progress}%</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5">
        <div
          className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      {sublabel && <p className="text-xs text-slate-500 mt-2">{sublabel}</p>}
    </div>
  );
}

// ============ MODAL ============
function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-bold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ============ ADD PHASE FORM ============
function AddPhaseForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (data: {
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    onSubmit({
      nombre: nombre.trim(),
      descripcion: descripcion.trim(),
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre de la fase *
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Diseño, Desarrollo, Testing..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción opcional de la fase..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha inicio
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Fecha fin
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !nombre.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Creando..." : "Crear Fase"}
        </button>
      </div>
    </form>
  );
}

// ============ ADD TASK FORM ============
function AddTaskForm({
  onSubmit,
  onCancel,
  isLoading,
  phaseName,
}: {
  onSubmit: (data: {
    titulo: string;
    descripcion: string;
    fecha_limite: string;
  }) => void;
  onCancel: () => void;
  isLoading: boolean;
  phaseName: string;
}) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    onSubmit({
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      fecha_limite: fechaLimite,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-slate-500">
        Agregando tarea a:{" "}
        <span className="font-medium text-slate-700">{phaseName}</span>
      </p>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Título de la tarea *
        </label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Crear wireframes, Implementar login..."
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          required
          autoFocus
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Descripción
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción opcional de la tarea..."
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Fecha límite
        </label>
        <input
          type="date"
          value={fechaLimite}
          onChange={(e) => setFechaLimite(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !titulo.trim()}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Creando..." : "Crear Tarea"}
        </button>
      </div>
    </form>
  );
}

// ============ HEADER ============
function ProjectHeader({
  project,
  progress,
  completedTasks,
  totalTasks,
}: {
  project: Project;
  progress: number;
  completedTasks: number;
  totalTasks: number;
}) {
  return (
    <div>
      <Link
        href="/crm/proyectos"
        className="text-sm text-slate-500 hover:text-indigo-600 mb-2 flex items-center transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Volver a Proyectos
      </Link>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-indigo-100 text-indigo-600 font-bold rounded-xl flex items-center justify-center text-xl">
            {getInitials(project.title || "PR")}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              {project.title}
            </h1>
            <p className="text-slate-500">
              Cliente:{" "}
              <span className="font-semibold text-slate-700">
                {project?.client?.nombre ||
                  project?.client?.empresa ||
                  "Sin cliente asignado"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="text-right flex-1 sm:flex-none">
            <p className="text-xs text-slate-500 uppercase font-bold">
              Progreso General
            </p>
            <div className="w-full sm:w-32 bg-slate-200 rounded-full h-2 mt-1">
              <div
                className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-indigo-600 mt-1">
              {progress}% Completado ({completedTasks}/{totalTasks} tareas)
            </p>
          </div>
          <div className="h-8 w-px bg-slate-300 mx-2 hidden sm:block" />
          <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all active:scale-95">
            <Settings className="w-4 h-4 inline-block mr-1" /> Configurar
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ TABS ============
const TABS: { id: TabType; label: string; icon: LucideIcon }[] = [
  { id: "checklist", label: "Cronograma (Fases)", icon: ListChecks },
  { id: "kanban", label: "Tablero Kanban", icon: LayoutGrid },
  { id: "files", label: "Archivos", icon: FileText },
  { id: "commits", label: "Commits (GitHub)", icon: GitCommit },
];

function TabNavigation({
  activeTab,
  onTabChange,
}: {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}) {
  return (
    <div className="border-b border-slate-200 overflow-x-auto">
      <nav className="-mb-px flex space-x-4 sm:space-x-8">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ============ CHECKLIST COMPONENTS ============
function TaskStatusIcon({ status }: { status: TaskStatus }) {
  if (status === "completada") {
    return (
      <div className="h-5 w-5 rounded-full bg-green-500 text-white flex items-center justify-center">
        <Check className="w-3 h-3" />
      </div>
    );
  }
  if (status === "bloqueada") {
    return (
      <div className="h-5 w-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
        <AlertCircle className="w-3 h-3" />
      </div>
    );
  }
  if (status === "en_progreso") {
    return (
      <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
        <Clock className="w-3 h-3" />
      </div>
    );
  }
  return <div className="h-5 w-5 rounded-full border-2 border-slate-300" />;
}

function TaskItem({ task }: { task: PhaseTask }) {
  return (
    <div className="p-4 hover:bg-slate-50 transition-colors flex items-start gap-3">
      <div className="mt-0.5">
        <TaskStatusIcon status={task.estado} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <div>
            <span
              className={`text-sm font-medium ${
                task.estado === "completada"
                  ? "text-slate-400 line-through"
                  : "text-slate-800"
              }`}
            >
              {task.titulo}
            </span>
            {task.estado === "bloqueada" && (
              <span className="ml-2 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                Bloqueada
              </span>
            )}
            {task.estado === "en_progreso" && (
              <span className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                En progreso
              </span>
            )}
          </div>
          {task.assigned && <Avatar name={task.assigned.nombre} />}
        </div>
        {task.descripcion && (
          <p className="text-xs text-slate-500 mt-1">{task.descripcion}</p>
        )}
        {task.fecha_limite && (
          <p className="text-xs text-slate-400 mt-1">
            Vence: {formatDate(task.fecha_limite)}
          </p>
        )}
      </div>
    </div>
  );
}

function PhaseCard({
  phase,
  isExpanded,
  onToggle,
  onAddTask,
}: {
  phase: ProjectPhase;
  isExpanded: boolean;
  onToggle: () => void;
  onAddTask: (phaseId: string, phaseName: string) => void;
}) {
  const isActive = phase.estado === "en_progreso";
  const isCompleted = phase.estado === "completada";
  const completedTasks = phase.phase_tasks.filter(
    (t) => t.estado === "completada"
  ).length;

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
        isActive
          ? "border-indigo-200 ring-2 ring-indigo-50"
          : "border-slate-200"
      } ${isCompleted ? "opacity-75" : ""}`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b flex justify-between items-center cursor-pointer transition-colors ${
          isActive
            ? "bg-indigo-50 border-indigo-100"
            : "bg-slate-50 border-slate-200"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {isCompleted ? (
            <div className="h-6 w-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs">
              <Check className="w-3 h-3" />
            </div>
          ) : (
            <div
              className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-300 text-slate-600"
              }`}
            >
              {phase.orden}
            </div>
          )}
          <div>
            <h3
              className={`font-bold ${
                isActive ? "text-indigo-900" : "text-slate-700"
              }`}
            >
              {phase.nombre}
            </h3>
            <p className="text-xs text-slate-500">
              {formatDate(phase.fecha_inicio)} - {formatDate(phase.fecha_fin)} •{" "}
              {completedTasks}/{phase.phase_tasks.length} tareas
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={phase.estado} size="md" />
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {/* Tasks */}
      {isExpanded && (
        <>
          <div className="p-0 divide-y divide-slate-100">
            {phase.phase_tasks
              .sort((a, b) => a.orden - b.orden)
              .map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
          </div>
          <div className="bg-slate-50 p-3 border-t border-slate-200 text-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddTask(phase.id, phase.nombre);
              }}
              className="text-sm text-indigo-600 font-medium hover:underline"
            >
              <Plus className="w-4 h-4 inline-block mr-1" /> Agregar Tarea
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ProjectSidebar({
  project,
  profiles,
}: {
  project: Project;
  profiles: TeamMember[];
}) {
  return (
    <div className="space-y-6">
      {/* Detalles */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase">
          Detalles
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-500">Descripción</label>
            <p className="text-sm text-slate-700 mt-1">
              {project.descripcion || "Sin descripción disponible."}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500">Inicio</label>
              <p className="text-sm font-medium text-slate-800">
                {formatDate(project.created_at)}
              </p>
            </div>
            <div>
              <label className="text-xs text-slate-500">Estado</label>
              <p className="text-sm font-medium text-slate-800 capitalize">
                {project.status || "Activo"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Equipo */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 text-sm uppercase">Equipo</h3>
          <button className="text-indigo-600 text-xs font-medium hover:underline">
            Gestionar
          </button>
        </div>
        <div className="space-y-3">
          {profiles.length > 0 ? (
            profiles.map((profile) => (
              <div key={profile.id} className="flex items-center gap-3">
                <Avatar name={profile.nombre} size="lg" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {profile.nombre}
                  </p>
                  <p className="text-xs text-slate-500">
                    {profile.rol || "Miembro"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">Sin miembros asignados</p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChecklistView({
  project,
  phases,
  profiles,
  onAddPhase,
  onAddTask,
}: {
  project: Project;
  phases: ProjectPhase[];
  profiles: TeamMember[];
  onAddPhase: (data: {
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
  }) => Promise<void>;
  onAddTask: (
    phaseId: string,
    data: { titulo: string; descripcion: string; fecha_limite: string }
  ) => Promise<void>;
}) {
  const [expandedPhases, setExpandedPhases] = useState<string[]>(
    phases.filter((p) => p.estado === "en_progreso").map((p) => p.id)
  );

  // Modal states
  const [showAddPhaseModal, setShowAddPhaseModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((prev) =>
      prev.includes(phaseId)
        ? prev.filter((id) => id !== phaseId)
        : [...prev, phaseId]
    );
  };

  const handleOpenAddTask = (phaseId: string, phaseName: string) => {
    setSelectedPhase({ id: phaseId, name: phaseName });
    setShowAddTaskModal(true);
  };

  const handleAddPhase = async (data: {
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
  }) => {
    setIsLoading(true);
    try {
      await onAddPhase(data);
      setShowAddPhaseModal(false);
    } catch (error) {
      console.error("Error al crear fase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (data: {
    titulo: string;
    descripcion: string;
    fecha_limite: string;
  }) => {
    if (!selectedPhase) return;
    setIsLoading(true);
    try {
      await onAddTask(selectedPhase.id, data);
      setShowAddTaskModal(false);
      setSelectedPhase(null);
    } catch (error) {
      console.error("Error al crear tarea:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const activePhase = phases.find((p) => p.estado === "en_progreso");
  const activePhaseProgress = activePhase
    ? Math.round(
        (activePhase.phase_tasks.filter((t) => t.estado === "completada")
          .length /
          activePhase.phase_tasks.length) *
          100
      )
    : 0;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
        <div className="lg:col-span-2 space-y-4">
          {activePhase && (
            <ProgressBar
              progress={activePhaseProgress}
              label={`Progreso: ${activePhase.nombre}`}
              sublabel={`${
                activePhase.phase_tasks.filter((t) => t.estado === "completada")
                  .length
              } de ${activePhase.phase_tasks.length} tareas completadas`}
            />
          )}

          {phases
            .sort((a, b) => a.orden - b.orden)
            .map((phase) => (
              <PhaseCard
                key={phase.id}
                phase={phase}
                isExpanded={expandedPhases.includes(phase.id)}
                onToggle={() => togglePhase(phase.id)}
                onAddTask={handleOpenAddTask}
              />
            ))}

          <button
            onClick={() => setShowAddPhaseModal(true)}
            className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors"
          >
            <Plus className="w-4 h-4 inline-block mr-1" /> Agregar Nueva Fase
          </button>
        </div>

        <ProjectSidebar project={project} profiles={profiles} />
      </div>

      {/* Modal para agregar fase */}
      <Modal
        isOpen={showAddPhaseModal}
        onClose={() => setShowAddPhaseModal(false)}
        title="Nueva Fase"
      >
        <AddPhaseForm
          onSubmit={handleAddPhase}
          onCancel={() => setShowAddPhaseModal(false)}
          isLoading={isLoading}
        />
      </Modal>

      {/* Modal para agregar tarea */}
      <Modal
        isOpen={showAddTaskModal}
        onClose={() => {
          setShowAddTaskModal(false);
          setSelectedPhase(null);
        }}
        title="Nueva Tarea"
      >
        <AddTaskForm
          onSubmit={handleAddTask}
          onCancel={() => {
            setShowAddTaskModal(false);
            setSelectedPhase(null);
          }}
          isLoading={isLoading}
          phaseName={selectedPhase?.name || ""}
        />
      </Modal>
    </>
  );
}

// ============ KANBAN VIEW ============
const KANBAN_COLUMNS = [
  {
    id: "pendiente",
    title: "Por Hacer",
    bg: "bg-slate-100",
    text: "text-slate-700",
    countBg: "bg-slate-200",
    countText: "text-slate-600",
  },
  {
    id: "en_progreso",
    title: "En Progreso",
    bg: "bg-indigo-50",
    text: "text-indigo-900",
    countBg: "bg-indigo-100",
    countText: "text-indigo-600",
  },
  {
    id: "bloqueada",
    title: "Bloqueadas",
    bg: "bg-red-50",
    text: "text-red-900",
    countBg: "bg-red-100",
    countText: "text-red-600",
  },
  {
    id: "completada",
    title: "Terminado",
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    countBg: "bg-emerald-100",
    countText: "text-emerald-600",
  },
];

function KanbanCard({
  task,
  columnId,
  onDragStart,
  isDragging,
}: {
  task: PhaseTask & { phaseName: string };
  columnId: string;
  onDragStart: (taskId: string) => void;
  isDragging: boolean;
}) {
  const borderClass =
    columnId === "en_progreso"
      ? "border-l-4 border-l-indigo-500 border-t-slate-200 border-r-slate-200 border-b-slate-200"
      : columnId === "bloqueada"
      ? "border-l-4 border-l-red-500 border-t-slate-200 border-r-slate-200 border-b-slate-200"
      : "border-slate-200";

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", task.id);
        onDragStart(task.id);
      }}
      className={`bg-white p-3 rounded-lg shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all border ${borderClass} ${
        task.estado === "completada" ? "bg-slate-50" : ""
      } ${isDragging ? "opacity-50 scale-95 ring-2 ring-indigo-400" : ""}`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
          {task.phaseName}
        </span>
        {task.assigned && <Avatar name={task.assigned.nombre} size="sm" />}
      </div>
      <p
        className={`text-sm font-medium ${
          task.estado === "completada"
            ? "text-slate-500 line-through"
            : "text-slate-800"
        }`}
      >
        {task.titulo}
      </p>
      {task.fecha_limite && (
        <p className="text-[11px] text-slate-400 mt-2">
          Vence: {formatDate(task.fecha_limite)}
        </p>
      )}
    </div>
  );
}

function KanbanView({
  phases,
  onUpdateTaskStatus,
}: {
  phases: ProjectPhase[];
  onUpdateTaskStatus: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}) {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const allTasks = phases.flatMap((phase) =>
    phase.phase_tasks.map((task) => ({ ...task, phaseName: phase.nombre }))
  );

  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTaskId || isUpdating) return;

    const task = allTasks.find((t) => t.id === draggedTaskId);
    if (!task || task.estado === columnId) {
      setDraggedTaskId(null);
      return;
    }

    setIsUpdating(true);
    try {
      await onUpdateTaskStatus(draggedTaskId, columnId as TaskStatus);
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    } finally {
      setIsUpdating(false);
      setDraggedTaskId(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="animate-fade-in overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[1100px]">
        {KANBAN_COLUMNS.map((column) => {
          const tasks = allTasks.filter((t) => t.estado === column.id);
          const isDragOver = dragOverColumn === column.id;

          return (
            <div
              key={column.id}
              className="w-1/4 flex flex-col gap-4"
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              onDragEnd={handleDragEnd}
            >
              <div
                className={`font-bold flex justify-between items-center ${column.bg} p-3 rounded-lg`}
              >
                <span className={column.text}>{column.title}</span>
                <span
                  className={`${column.countBg} ${column.countText} px-2 rounded-full text-xs`}
                >
                  {tasks.length}
                </span>
              </div>
              <div
                className={`space-y-3 min-h-[200px] rounded-lg transition-colors p-2 -m-2 ${
                  isDragOver
                    ? "bg-indigo-50 ring-2 ring-indigo-200 ring-dashed"
                    : ""
                }`}
              >
                {tasks.map((task) => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    columnId={column.id}
                    onDragStart={handleDragStart}
                    isDragging={draggedTaskId === task.id}
                  />
                ))}
                {tasks.length === 0 && (
                  <div
                    className={`h-20 flex items-center justify-center text-sm text-slate-400 border-2 border-dashed rounded-lg ${
                      isDragOver
                        ? "border-indigo-300 bg-indigo-50"
                        : "border-slate-200"
                    }`}
                  >
                    {isDragOver ? "Soltar aquí" : "Sin tareas"}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {isUpdating && (
        <div className="fixed bottom-4 right-4 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          Actualizando...
        </div>
      )}
    </div>
  );
}

// ============ FILES VIEW ============
function FilesView() {
  const files = [
    {
      id: 1,
      name: "Alcance_v2.pdf",
      type: "pdf",
      date: "20 Oct 2024",
      uploadedBy: "Laura M.",
    },
    {
      id: 2,
      name: "Mockups_UI.png",
      type: "image",
      date: "22 Oct 2024",
      uploadedBy: "Ana T.",
    },
  ];

  const getFileColor = (type: string) =>
    ({ pdf: "text-red-500", image: "text-purple-500" }[type] ||
    "text-slate-500");

  return (
    <div className="animate-fade-in">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-slate-500">
                Nombre
              </th>
              <th className="px-6 py-3 text-left font-medium text-slate-500 hidden sm:table-cell">
                Fecha
              </th>
              <th className="px-6 py-3 text-left font-medium text-slate-500 hidden md:table-cell">
                Subido por
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-2">
                  <FileText className={`w-5 h-5 ${getFileColor(file.type)}`} />
                  <span className="font-medium text-slate-800">
                    {file.name}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-500 hidden sm:table-cell">
                  {file.date}
                </td>
                <td className="px-6 py-4 text-slate-700 hidden md:table-cell">
                  {file.uploadedBy}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ COMMITS VIEW ============
function CommitsView() {
  const commits = [
    {
      hash: "c4f2a1",
      message: "feat: implement jwt auth strategy",
      author: "Pedro R.",
      time: "2h ago",
    },
    {
      hash: "b21d99",
      message: "fix: login button alignment on mobile",
      author: "Ana T.",
      time: "5h ago",
    },
    {
      hash: "a00c22",
      message: "chore: initial commit",
      author: "Laura M.",
      time: "2d ago",
    },
  ];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="bg-slate-900 rounded-xl p-4 text-slate-300 font-mono text-xs border border-slate-700">
        <div className="flex gap-2 items-center mb-2 text-slate-500 border-b border-slate-700 pb-2">
          <span>repo/proyecto</span>
          <span className="text-slate-600">| branch: main</span>
        </div>
        <div className="space-y-3">
          {commits.map((commit) => (
            <div
              key={commit.hash}
              className="flex flex-col sm:flex-row sm:justify-between hover:bg-slate-800 p-2 rounded cursor-pointer gap-1"
            >
              <div className="flex flex-wrap gap-2">
                <span className="text-indigo-400">{commit.hash}</span>
                <span className="text-white">{commit.message}</span>
              </div>
              <div className="text-slate-500 text-[11px]">
                {commit.author} • {commit.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function ProjectContentPage({
  project,
  refetch,
}: {
  project: Project;
  refetch: () => void;
}) {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState<TabType>("checklist");

  const allTasks = project.project_phases?.flatMap((p) => p.phase_tasks) || [];
  const completedTasks = allTasks.filter(
    (t) => t.estado === "completada"
  ).length;
  const overallProgress =
    allTasks.length > 0
      ? Math.round((completedTasks / allTasks.length) * 100)
      : 0;

  const profiles =
    project.project_emplooyes?.map((e) => ({
      id: e.profiles.id,
      nombre: e.profiles.nombre,
      rol: e.profiles.roles?.rol || null,
    })) || [];

  // Handler para agregar fase
  const handleAddPhase = async (data: {
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
  }) => {
    const { error } = await supabase.from("project_phases").insert({
      project_id: project.id,
      nombre: data.nombre,
      descripcion: data.descripcion || null,
      fecha_inicio: data.fecha_inicio || null,
      fecha_fin: data.fecha_fin || null,
      estado: "pendiente",
      orden: (project.project_phases?.length || 0) + 1,
    });
    if (error) throw error;
    refetch();
  };

  // Handler para agregar tarea
  const handleAddTask = async (
    phaseId: string,
    data: { titulo: string; descripcion: string; fecha_limite: string }
  ) => {
    const phase = project.project_phases?.find((p) => p.id === phaseId);
    const { error } = await supabase.from("phase_tasks").insert({
      phase_id: phaseId,
      titulo: data.titulo,
      descripcion: data.descripcion || null,
      fecha_limite: data.fecha_limite || null,
      estado: "pendiente",
      orden: (phase?.phase_tasks?.length || 0) + 1,
    });
    if (error) throw error;
    refetch();
  };

  // Handler para actualizar estado de tarea (Kanban drag & drop)
  const handleUpdateTaskStatus = async (
    taskId: string,
    newStatus: TaskStatus
  ) => {
    const { error } = await supabase
      .from("phase_tasks")
      .update({ estado: newStatus })
      .eq("id", taskId);

    if (error) throw error;
    refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <ProjectHeader
        project={project}
        progress={overallProgress}
        completedTasks={completedTasks}
        totalTasks={allTasks.length}
      />
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "checklist" && (
        <ChecklistView
          project={project}
          phases={project.project_phases || []}
          profiles={profiles}
          onAddPhase={handleAddPhase}
          onAddTask={handleAddTask}
        />
      )}
      {activeTab === "kanban" && (
        <KanbanView
          phases={project.project_phases || []}
          onUpdateTaskStatus={handleUpdateTaskStatus}
        />
      )}
      {activeTab === "files" && <FilesView />}
      {activeTab === "commits" && <CommitsView />}
    </div>
  );
}
