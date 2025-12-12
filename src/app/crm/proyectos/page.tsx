"use client";

import { useEffect, useState, useRef } from "react";
import { Search, UserPlus, X, Loader2, ChevronDown } from "lucide-react";
import { useProjectEmployeeData, useProjects } from "@/hooks/admin/useProjects";
import ProjectsTable from "./components/projectTable";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, useUserRolProfiles } from "@/hooks/admin/useRoles";
import { createClient } from "@/lib/supabase/client";

const allowedRoles = ["CEO", "COO", "Desarrollador", "Diseñador", "QA"];

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
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

// ============ SEARCHABLE SELECT ============
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder,
}: {
  options: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.id === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center justify-between bg-white"
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                    value === option.id
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No se encontraron resultados
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ============ ASSIGN EMPLOYEE FORM ============
function AssignEmployeeForm({
  onSubmit,
  onCancel,
  isLoading,
}: {
  onSubmit: (projectId: string, userId: string) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const { data, isLoading: isLoadingData } = useProjectEmployeeData();

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !selectedUserId) return;
    onSubmit(selectedProjectId, selectedUserId);
  };

  const projectOptions =
    data?.projects?.map((p) => ({
      id: p.id,
      label: p.title,
    })) || [];

  const employeeOptions =
    data?.employees?.map((e) => ({
      id: e.id,
      label: e.nombre + (e.roles?.rol ? ` (${e.roles.rol})` : ""),
    })) || [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLoadingData ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proyecto *
            </label>
            <SearchableSelect
              options={projectOptions}
              value={selectedProjectId}
              onChange={setSelectedProjectId}
              placeholder="Seleccionar proyecto..."
              searchPlaceholder="Buscar proyecto..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empleado *
            </label>
            <SearchableSelect
              options={employeeOptions}
              value={selectedUserId}
              onChange={setSelectedUserId}
              placeholder="Seleccionar empleado..."
              searchPlaceholder="Buscar empleado..."
            />
          </div>
        </>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={
            isLoading || !selectedProjectId || !selectedUserId || isLoadingData
          }
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isLoading ? "Asignando..." : "Asignar Empleado"}
        </button>
      </div>
    </form>
  );
}

export default function ProjectsPage() {
  const supabase = createClient();
  const { roleAdmin } = useAuth();
  const router = useRouter();

  const { isLoading: loadingRoles, isError: errorRoles } = useRoles();
  const { isLoading: loadingUsers, isError: errorUsers } = useUserRolProfiles();
  const { data: projects = [], isLoading, error, refetch } = useProjects();

  const [searchTerm, setSearchTerm] = useState("");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);

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

  const handleAssignEmployee = async (projectId: string, userId: string) => {
    setIsAssigning(true);
    try {
      const { error } = await supabase.from("project_emplooyes").insert({
        project_id: projectId,
        user_id: userId,
      });
      if (error) throw error;
      setShowAssignModal(false);
      refetch();
    } catch (error) {
      console.error("Error al asignar empleado:", error);
    } finally {
      setIsAssigning(false);
    }
  };

  if (hasAccess === null || loadingRoles || loadingUsers) {
    return <p className="p-6 text-blue-600">Validando datos...</p>;
  }

  if (errorRoles || errorUsers) {
    return <p className="p-6 text-red-600">Error al cargar datos</p>;
  }

  if (!hasAccess) return null;

  if (isLoading) return <div>Cargando proyectos</div>;
  if (error) return <div>Error: {error.message}</div>;

  const filtered = projects.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Proyectos</h1>
        <p className="mt-2 text-gray-600">Gestiona tus proyectos</p>
      </div>

      {/* Búsqueda y Acciones */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          />
        </div>

        <button
          onClick={() => setShowAssignModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <UserPlus className="w-5 h-5" />
          Asignar Empleado
        </button>
      </div>

      {/* Tabla de proyectos */}
      <ProjectsTable projects={filtered} />

      {/* Modal para asignar empleado */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Asignar Empleado a Proyecto"
      >
        <AssignEmployeeForm
          onSubmit={handleAssignEmployee}
          onCancel={() => setShowAssignModal(false)}
          isLoading={isAssigning}
        />
      </Modal>
    </div>
  );
}
