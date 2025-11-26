"use client";

import { useState } from "react";
import { Client, Project } from "../page";
import { useSecundarios } from "@/hooks/admin/useProfiles";
import { createClient } from "@/lib/supabase/client";

type AccessModalProps = {
  show: boolean;
  client: Client;
  onClose: () => void;
  projects: Project[];
  refetchProfile: () => void;
};

export default function AccessModal({
  show,
  client,
  onClose,
  projects,
  refetchProfile,
}: AccessModalProps) {
  const projectIds = projects.map((p) => p.id);
  const {
    data: secundarios,
    isLoading,
    isError,
    error,
    refetch,
  } = useSecundarios(projectIds);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUser, setNewUser] = useState({
    nombre: "",
    email: "",
    password: "",
    project_id: "",
  });
  const [loading, setLoading] = useState(false);

  if (!show) return null;
  const handleCreateAccess = async () => {
    if (
      !newUser.nombre ||
      !newUser.email ||
      !newUser.password ||
      !newUser.project_id
    )
      return alert("Completa todos los campos");
    const supabase = createClient();
    setLoading(true);

    try {
      const res = await fetch("/api/create-access-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: newUser.nombre,
          email: newUser.email,
          password: newUser.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al crear el acceso");

      const userId = data.user.id;

      const { error } = await supabase.from("project_users").insert([
        {
          project_id: newUser.project_id,
          user_id: userId,
          type: "Secundario",
        },
      ]);

      setNewUser({ nombre: "", email: "", password: "", project_id: "" });
      setShowCreateForm(false);
      refetch();
      refetchProfile();
    } catch (err) {
      console.error(err);
      alert("Error al crear el acceso");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-20 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl">
        <h2 className="text-2xl font-bold mb-4">Accesos del cliente</h2>

        {/* Usuario Principal */}
        <div className="p-4 mb-4 bg-blue-100 rounded-lg shadow flex justify-between items-center">
          <div>
            <p className="font-semibold">{client.nombre}</p>
            <p className="text-sm text-gray-700">Acceso Principal</p>
          </div>
        </div>

        {/* Usuarios Secundarios */}
        <div className="mb-4">
          {isLoading && (
            <p className="text-gray-500 text-center">
              Cargando usuarios secundarios...
            </p>
          )}
          {isError && (
            <p className="text-red-500 text-center">{error?.message}</p>
          )}
          {!isLoading && secundarios?.length === 0 && (
            <p className="text-gray-500 text-center">
              No hay usuarios secundarios
            </p>
          )}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {secundarios?.map((user: any) => (
            <div
              key={user.profile?.id + user.project_id}
              className="p-4 mb-2 bg-gray-100 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{user.profile?.nombre}</p>
                <p className="text-sm text-gray-700">{user.profile?.email}</p>
                <p className="text-xs text-gray-500">Acceso Secundario</p>
                {user?.project?.title && (
                  <p className="text-xs text-gray-500">
                    Proyecto: {user?.project?.title}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Formulario para crear acceso */}
        <div className="mb-4">
          <div className="flex justify-between">
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mb-2 cursor-pointer"
            >
              {showCreateForm ? "Cancelar" : "Crear nuevo acceso"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 mb-2 cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          {showCreateForm && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <input
                type="text"
                placeholder="Nombre"
                value={newUser.nombre}
                onChange={(e) =>
                  setNewUser({ ...newUser, nombre: e.target.value })
                }
                className="w-full border p-2 rounded-lg"
              />
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="w-full border p-2 rounded-lg"
              />
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="w-full border p-2 rounded-lg"
              />
              <select
                className="w-full border p-2 rounded-lg"
                value={newUser.project_id}
                onChange={(e) =>
                  setNewUser({ ...newUser, project_id: e.target.value })
                }
              >
                <option value="">Selecciona un proyecto</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>

              <button
                onClick={handleCreateAccess}
                disabled={loading}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-2 w-full cursor-pointer"
              >
                {loading ? "Creando..." : "Crear acceso"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
