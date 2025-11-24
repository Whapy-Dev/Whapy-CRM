"use client";

type Log = {
  accion: string;
  fecha: string;
  id: number;
  seccion: string;
  usuario_modificado: string;
  usuario_modificador_id: {
    id: string;
    nombre: string;
  }[] | null;
};

interface Props {
  logs: Log[];
}

export default function ActividadTable({ logs }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-lg">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Usuario Modificador</th>
            <th className="p-3 text-left">Acción</th>
            <th className="p-3 text-left">Usuario Modificado</th>
            <th className="p-3 text-left">Sección</th>
          </tr>
        </thead>

        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                No hay registros que coincidan.
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{new Date(log.fecha).toLocaleString()}</td>

                <td className="p-3">{log.usuario_modificador_id?.[0].nombre}</td>
                <td className="p-3">{log.accion}</td>

                <td className="p-3">{log.usuario_modificado}</td>

                <td className="p-3">{log.seccion}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
