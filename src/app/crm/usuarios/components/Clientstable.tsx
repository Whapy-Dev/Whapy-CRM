import { MoreVertical } from "lucide-react";
import { Client } from "../page";
import Link from "next/link";

type ClientsTableProps = {
  clients: Client[];
  onClientClick: (client: Client) => void;
};

export default function ClientsTable({
  clients,
  onClientClick,
}: ClientsTableProps) {
  if (!clients || clients.length === 0) {
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
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Acciones
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Presupuesto
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                A realizar por
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Estado Presupuesto
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Nombre
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Email
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Teléfono
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Empresa
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Género
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                País
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Tipo
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Estado
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase">
                Fecha de creación
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {clients.map((client) => {
              const presupuestoTotal =
                client?.projects?.reduce(
                  (sum, p) => sum + (p?.presupuestos?.[0]?.monto || 0),
                  0
                ) ?? 0;

              const divisa = client?.projects?.[0]?.presupuestos?.[0]?.divisa;
              const estadoPresupuesto =
                client?.projects?.[0]?.presupuestos?.[0]?.estado ?? "—";
              const realizarPor =
                client?.projects?.[0]?.presupuestos?.[0]?.profiles?.nombre ??
                "—";

              return (
                <tr
                  key={client.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => onClientClick(client)}
                >
                  {/* Acciones */}
                  <td className="text-center">
                    <Link
                      href={`/crm/usuarios/${client.id}/client`}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer p-2 inline-block rotate-90"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </Link>
                  </td>

                  {/* Presupuesto Total */}
                  <td className="px-2 py-4 text-sm text-gray-900 text-center font-medium">
                    {divisa} {presupuestoTotal.toLocaleString("es-AR") || "0"}
                  </td>

                  {/* A realizar por */}
                  <td className="px-2 py-4 text-sm text-gray-900 text-center">
                    {realizarPor}
                  </td>

                  {/* Estado Presupuesto */}
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {estadoPresupuesto}
                  </td>

                  {/* Nombre */}
                  <td className="px-2 py-4 text-sm text-gray-900 text-center">
                    {client.nombre || "—"}
                  </td>

                  {/* Email */}
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {client.email || "—"}
                  </td>

                  {/* Teléfono */}
                  <td className="px-2 py-4 text-sm text-gray-700 text-center text-nowrap">
                    {client.telefono || "—"}
                  </td>

                  {/* Empresa */}
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {client.empresa || "—"}
                  </td>

                  {/* Género */}
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {client.genero || "—"}
                  </td>

                  {/* País */}
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {client.pais || "—"}
                  </td>

                  {/* Tipo */}
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {client.type || "—"}
                  </td>

                  {/* Estado (Activo / Inactivo) */}
                  <td className="px-2 py-4 text-sm text-center">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full text-nowrap ${
                        client.estado === "Activo"
                          ? "bg-green-100 text-green-700"
                          : client.estado === "Inactivo"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {client.estado || "—"}
                    </span>
                  </td>

                  {/* Fecha de creación */}
                  <td className="px-2 py-4 text-sm text-gray-500 text-center">
                    {client.created_at
                      ? new Date(client.created_at).toLocaleDateString(
                          "es-AR",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          }
                        )
                      : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
