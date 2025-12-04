import { MoreVertical } from "lucide-react";
import { Client } from "../page";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ClientsTableProps = {
  clients: Client[];
};
function timeAgo(fecha: string) {
  const date = new Date(fecha);
  const ahora = new Date();
  const diffMs = ahora.getTime() - date.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffSemanas = Math.floor(diffDias / 7);
  const diffMeses = Math.floor(diffDias / 30);

  if (diffMeses >= 1)
    return `hace ${diffMeses} ${diffMeses === 1 ? "mes" : "meses"}`;
  if (diffSemanas >= 1)
    return `hace ${diffSemanas} ${diffSemanas === 1 ? "semana" : "semanas"}`;
  return `hace ${diffDias} ${diffDias === 1 ? "día" : "días"}`;
}

export default function ClientsTable({ clients }: ClientsTableProps) {
  const router = useRouter();
  if (!clients || clients.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-500">
          No se encontraron usuarios
        </div>
      </div>
    );
  }

  const headers = [
    "Acciones",
    "Presupuesto",
    "A realizar por",
    "Estado Presupuesto",
    "Nombre",
    "Email",
    "Teléfono",
    "Empresa",
    "Género",
    "País",
    "Tipo",
    "Estado",
    "Fecha de creación",
  ];
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className="px-4 py-4 text-center text-xs font-semibold text-gray-700 uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {clients.map((client) => {
              const proyectos = client.projects ?? [];

              // Obtenemos todos los presupuestos como objetos (1 por proyecto)
              const presupuestos = proyectos
                .map((project) => project.presupuesto)
                .filter(Boolean);

              // Lista de nombres de empleados responsables por presupuesto
              const realizarPorLista = presupuestos.flatMap(
                (pre) =>
                  pre?.presupuestos_employees?.map(
                    (emp) => emp.profiles.nombre
                  ) ?? ["—"]
              );

              // Lista de estados de cada presupuesto
              const estadosLista = presupuestos.map(
                (pre) => pre?.estado ?? "—"
              );

              // Lista de montos de cada presupuesto
              const presupuestoListado = presupuestos.map(
                (pre) =>
                  `${pre?.divisa ?? ""} ${
                    pre?.monto?.toLocaleString("es-AR") ?? 0
                  }`
              );

              return (
                <tr
                  key={client.id}
                  onClick={() => {
                    router.push(`/crm/usuarios/${client.id}/client`);
                  }}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="text-center">
                    <button
                      className="text-gray-400 hover:text-gray-600 p-2 inline-block rotate-90"
                      onClick={(e) => {
                        e.stopPropagation();
                        // acá va tu lógica del menú de acciones en el futuro
                      }}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>

                  {/* 📌 Presupuestos uno abajo del otro */}
                  <td className="px-2 py-4 text-sm text-gray-900 text-center font-medium text-nowrap">
                    {presupuestoListado.length > 0
                      ? presupuestoListado.map((text, i) => (
                          <div key={i}>{text}</div>
                        ))
                      : "—"}
                  </td>

                  {/* 📌 Responsables uno abajo del otro */}
                  <td className="px-2 py-4 text-sm text-gray-900 text-center text-nowrap">
                    {realizarPorLista.length > 0
                      ? realizarPorLista.map((nombre, i) => (
                          <div key={i}>{nombre}</div>
                        ))
                      : "—"}
                  </td>

                  {/* 📌 Estados uno abajo del otro */}
                  <td className="px-2 py-4 text-sm text-gray-700 text-center text-nowrap">
                    {estadosLista.length > 0
                      ? estadosLista.map((estado, i) => (
                          <div key={i}>{estado}</div>
                        ))
                      : "—"}
                  </td>

                  {/* resto de columnas sin cambios */}
                  <td className="px-2 py-4 text-sm text-gray-900 text-center">
                    {client.nombre || "—"}
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {client.email || "—"}
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-700 text-center text-nowrap">
                    {client.telefono || "—"}
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {client.empresa || "—"}
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {client.genero || "—"}
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {client.pais || "—"}
                  </td>
                  <td className="px-2 py-4 text-sm text-gray-700 text-center">
                    {client.type || "—"}
                  </td>

                  <td className="px-2 py-4 text-sm text-center">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
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

                  <td className="px-2 py-4 text-sm text-gray-500 text-center">
                    {client.created_at ? (
                      <>
                        <div>
                          {new Date(client.created_at).toLocaleDateString(
                            "es-AR",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {timeAgo(client.created_at)}
                        </div>
                      </>
                    ) : (
                      "—"
                    )}
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
