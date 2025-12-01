"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { useProjects } from "@/hooks/admin/useProjects";
import ProjectsTable from "./components/projectTable";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useRoles, useUserRolProfiles } from "@/hooks/admin/useRoles";

const allowedRoles = ["CEO", "COO", "Desarrollador", "Diseñador"];

export default function ProjectsPage() {
  const { roleAdmin } = useAuth();
  const router = useRouter();

  const { isLoading: loadingRoles, isError: errorRoles } = useRoles();
  const { isLoading: loadingUsers, isError: errorUsers } = useUserRolProfiles();
  const { data: projects = [], isLoading, error } = useProjects();

  const [searchTerm, setSearchTerm] = useState("");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  console.log(projects);
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

  if (hasAccess === null || loadingRoles || loadingUsers || loadingUsers) {
    return <p className="p-6 text-blue-600">Validando datos...</p>;
  }

  if (errorRoles || errorUsers) {
    return <p className="p-6 text-red-600">Error al cargar datos</p>;
  }

  if (!hasAccess) return null;

  if (isLoading || isLoading) return <div>Cargando proyectos</div>;
  if (error) return <div>Error: {error.message}</div>;

  // Si querés hacer búsqueda, filtramos antes de mandar a la tabla:
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

      {/* Búsqueda */}
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
      </div>

      {/* ✅ Renderizamos la tabla como componente individual */}
      <ProjectsTable projects={filtered} />
    </div>
  );
}
