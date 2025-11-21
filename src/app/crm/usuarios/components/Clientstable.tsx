import { MoreVertical } from "lucide-react";
import { Client } from "../page";

type ClientsTableProps = {
  clients: Client[];
  onClientClick: (client: Client) => void;
};

export default function ClientsTable({
  clients,
  onClientClick,
}: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No se encontraron usuarios
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {[
                "Acciones",
                "Nombre",
                "Email",
                "Teléfono",
                "Empresa",
                "Ciudad",
                "Código Postal",
                "Género",
                "Fecha de Nacimiento",
                "País",
                "Tipo",
                "Estado",
                "Fecha de creación",
              ].map((head) => (
                <th
                  key={head}
                  className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                >
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {clients.map((client) => (
              <tr
                key={client.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="text-center">
                  <button
                    onClick={() => onClientClick(client)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
                <td className="px-2 py-4 text-sm text-gray-900 text-pretty">
                  {client.nombre || "—"}
                </td>
                <td className="px-2 py-4 text-sm text-gray-700">
                  {client.email}
                </td>
                <td className="px-2 py-4 text-sm text-gray-700 text-nowrap">
                  {client.telefono || "—"}
                </td>
                <td className="px-2 py-4 text-sm text-gray-700 text-pretty">
                  {client.empresa || "—"}
                </td>
                <td className="px-2 py-4 text-sm text-gray-700 text-nowrap">
                  {client.ciudad || "—"}
                </td>
                <td className="px-2 py-4 text-sm text-gray-700 text-pretty">
                  {client.codigoPostal || "—"}
                </td>
                <td className="px-2 py-4 text-sm text-gray-700">
                  {client.genero || "—"}
                </td>
                <td className="px-2 py-4 text-sm text-gray-700">
                  {client.fechaNacimiento || "—"}
                </td>
                <td className="px-2 py-4 text-sm text-gray-700">
                  {client.pais || "—"}
                </td>
                <td className="px-2 py-4 text-sm text-gray-700">
                  {client.type || "—"}
                </td>
                <td className="px-2 py-4 text-sm">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full text-nowrap ${
                      client.estado === "Activo"
                        ? "bg-green-100 text-green-700"
                        : client.estado === "Inactivo"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {client.estado}
                  </span>
                </td>
                <td className="px-2 py-4 text-sm text-gray-500">
                  {client.created_at
                    ? new Date(client.created_at).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
