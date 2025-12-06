// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ActividadTable({ logs }: any) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border rounded-lg">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-3 text-left">Fecha</th>
            <th className="p-3 text-left">Usuario Modificador</th>
            <th className="p-3 text-left">Acción</th>
            <th className="p-3 text-left">Detalles</th>
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
            logs.map(
              (
                log: any // eslint-disable-line @typescript-eslint/no-explicit-any
              ) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {new Date(log.fecha).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {log.usuario_modificador_id?.nombre ?? ""}
                  </td>
                  <td className="p-3">{log.accion}</td>
                  <td className="p-3">{log.detalles}</td>
                  <td className="p-3">{log.usuario_modificado}</td>
                  <td className="p-3">{log.seccion}</td>
                </tr>
              )
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
