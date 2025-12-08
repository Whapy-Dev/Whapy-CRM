// index.tsx - Componente principal del modal de presupuestos
"use client";

import { useState, useEffect } from "react";
import { Calendar } from "lucide-react";
import { useBudgetData } from "@/hooks/admin/usePresupuestos";
import { Project } from "@/utils/types";
import { BudgetModalProps } from "./types";
import ProjectSidebar from "./components/ProjectSidebar";
import CreateBudgetForm from "./components/CreateBudgetForm";
import EditarTab from "./tabs/EditarTab";
import AnexosTab from "./tabs/AnexosTab";
import FasesTab from "./tabs/FasesTab";
import PnlTab from "./tabs/PnlTab";

type TabType = "editar" | "anexos" | "fases" | "pnl";

export default function BudgetModal({
  show,
  projects,
  clientNombre,
  onClose,
  refetchProfile,
}: BudgetModalProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("editar");

  // Hook para cargar datos
  const {
    anexos,
    fases,
    admins,
    documents,
    loadingData,
    refetchAnexos,
    refetchFases,
  } = useBudgetData(selectedProject);

  // Determinar si el proyecto tiene presupuesto
  const tienePresupuesto = selectedProject?.presupuesto != null;

  // Resetear tab cuando cambia el proyecto
  useEffect(() => {
    setActiveTab("editar");
  }, [selectedProject?.id]);

  // Cerrar modal y limpiar estado
  const handleClose = () => {
    setSelectedProject(null);
    setActiveTab("editar");
    onClose();
  };

  if (!show) return null;

  const tabs: { id: TabType; label: string; disabled?: boolean }[] = [
    { id: "editar", label: "Editar presupuesto" },
    { id: "anexos", label: "Anexos" },
    { id: "fases", label: "Fases y Cuotas" },
    { id: "pnl", label: "PNL" },
  ];

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-11/12 max-h-[95vh] overflow-y-auto p-6 cursor-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={22} />
          <h3 className="text-2xl font-bold">Gestión de Presupuestos</h3>
        </div>

        <div className="flex gap-6">
          {/* Sidebar de proyectos */}
          <ProjectSidebar
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
          />

          {/* Panel principal */}
          <div className="flex-1 min-h-[400px]">
            {!selectedProject ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Seleccioná un proyecto para gestionar su presupuesto</p>
              </div>
            ) : !tienePresupuesto ? (
              /* Formulario para crear presupuesto */
              <CreateBudgetForm
                selectedProject={selectedProject}
                admins={admins}
                documents={documents}
                clientNombre={clientNombre}
                onClose={handleClose}
                refetchProfile={refetchProfile}
              />
            ) : (
              /* Tabs para editar presupuesto existente */
              <div className="space-y-4">
                {/* Tabs navigation */}
                <div className="flex gap-2 border-b pb-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      disabled={tab.disabled}
                      className={`px-4 py-2 rounded-t-lg transition cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      } ${tab.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Loading indicator */}
                {loadingData && (
                  <div className="text-center py-4 text-gray-500">
                    Cargando datos...
                  </div>
                )}

                {/* Tab content */}
                {!loadingData && (
                  <>
                    {activeTab === "editar" && (
                      <EditarTab
                        selectedProject={selectedProject}
                        loading={loading}
                        setLoading={setLoading}
                        refetchProfile={refetchProfile}
                        onClose={handleClose}
                      />
                    )}

                    {activeTab === "anexos" && (
                      <AnexosTab
                        selectedProject={selectedProject}
                        anexos={anexos}
                        loading={loading}
                        setLoading={setLoading}
                        refetchAnexos={refetchAnexos}
                      />
                    )}

                    {activeTab === "fases" && (
                      <FasesTab
                        selectedProject={selectedProject}
                        fases={fases}
                        loading={loading}
                        setLoading={setLoading}
                        refetchFases={refetchFases}
                      />
                    )}

                    {activeTab === "pnl" && (
                      <PnlTab
                        selectedProject={selectedProject}
                        loading={loading}
                        setLoading={setLoading}
                      />
                    )}
                  </>
                )}

                {/* Botones de acción global */}
                {activeTab !== "editar" && (
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <button
                      onClick={handleClose}
                      className="px-5 py-2 border rounded-xl hover:bg-gray-100 transition cursor-pointer"
                      disabled={loading}
                    >
                      Cerrar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
