"use client";

type Egresos = {
  id: string;
  profiles?: {
    nombre: string;
  };
  Egreso?: number;
  Descripcion?: string;
  created_at: string;
};

type Props = {
  egresos: Egresos[];
  isLoading: boolean;
};

export function TableEgresos({ egresos, isLoading }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Egresos</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b text-gray-700">
              <th className="text-left p-3">Descripción</th>
              <th className="text-left p-3">Usuario</th>
              <th className="text-right p-3">Monto</th>
              <th className="text-left p-3">Fecha</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4} className="p-4 text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}

            {!isLoading && egresos.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-gray-500">
                  No hay egresos
                </td>
              </tr>
            )}

            {!isLoading &&
              egresos.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b hover:bg-gray-50 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td className="p-3">{item.Descripcion || "-"}</td>
                  <td className="p-3">{item.profiles?.nombre || "-"}</td>
                  <td className="text-right font-semibold text-red-600 p-3">
                    ${Number(item.Egreso || 0).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
