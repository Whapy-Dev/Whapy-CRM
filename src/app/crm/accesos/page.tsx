"use client";

import { useEffect, useState } from "react";
import { Roles, useRoles, useUserRolProfiles } from "@/hooks/admin/useRoles";
import { UserTable } from "./components/AccesosTable";
import { CreateAccessModal } from "./components/CreateAccessModal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
const allowedRoles = ["CEO", "COO", "QA"];
export default function Page() {
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

  const [showModal, setShowModal] = useState(false);
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // null = todavía no sabemos

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

  // Filtrado de usuarios
  const filteredUsers = users?.filter((u) => {
    const matchesNombre = u.nombre
      .toLowerCase()
      .includes(filtroNombre.toLowerCase());

    const rolesArray = u.roles
      ? Array.isArray(u.roles)
        ? u.roles
        : [u.roles] // convierte objeto a array si es necesario
      : [];

    const matchesRol = filtroRol
      ? rolesArray.some((r) => r.rol === filtroRol)
      : true;

    return matchesNombre && matchesRol;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Accesos</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Crear Acceso
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 my-4">
        <input
          type="text"
          placeholder="Filtrar por nombre"
          value={filtroNombre}
          onChange={(e) => setFiltroNombre(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Todos los roles</option>
          {roles?.map((role: Roles) => (
            <option key={role.id} value={role.rol}>
              {role.rol}
            </option>
          ))}
        </select>
      </div>

      {/* Tabla de usuarios */}
      <UserTable users={filteredUsers || []} onDeleted={() => refetchUsers()} />

      {/* Modal para crear acceso */}
      {showModal && (
        <CreateAccessModal
          roles={roles}
          onClose={() => setShowModal(false)}
          onCreated={() => refetchUsers()}
        />
      )}
    </div>
  );
}
