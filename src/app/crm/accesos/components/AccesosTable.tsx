import { UserProfile } from "@/hooks/admin/useRoles";

export function UserTable({
  users,
  onDeleted,
}: {
  users: UserProfile[];
  onDeleted: () => void;
}) {
  const handleDelete = async (userId: string) => {
    if (!confirm("¿Estás seguro de borrar este acceso?")) return;

    try {
      const res = await fetch("/api/delete-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al borrar usuario");

      alert("Usuario eliminado correctamente");
      onDeleted(); // refrescar lista de usuarios
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Error desconocido");
    }
  };

  return (
    <div className="overflow-x-auto mt-6">
      <table className="min-w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Rol</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const rolesArray = user.roles
              ? Array.isArray(user.roles)
                ? user.roles
                : [user.roles]
              : [];

            const isCEO = rolesArray.some((r) => r.rol === "CEO");

            return (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-2 border text-center">{user.nombre}</td>
                <td className="p-2 border text-center">{user.email}</td>
                <td className="p-2 border text-center">
                  {rolesArray.map((r) => r.rol).join(", ") || "-"}
                </td>
                <td className="p-2 border text-center">
                  <button
                    onClick={() => handleDelete(user.id)}
                    disabled={isCEO}
                    className={`px-2 py-1 rounded ${
                      isCEO
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-red-600 text-white hover:bg-red-700 cursor-pointer"
                    }`}
                  >
                    Borrar Acceso
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
