// TableEgresos.tsx
"use client";

import { useState } from "react";
import { ModalAgregarEgreso } from "./AgregarEgresoModal";
import { createClient } from "@/lib/supabase/client";

type Egresos = {
  id: string;
  user_id?: string;
  profiles?: {
    nombre: string;
  };
  Egreso?: number;
  Descripcion?: string;
  categoria: string;
  subcategoria: string;
  created_at: string;
  recurrente: string;
  divisa: string;
  es_recurrente: boolean;
  fecha_recurrente: string;
  intervalo: string;
  factura_url?: string;
};

type Props = {
  egresos: Egresos[];
  isLoading: boolean;
  refetchEgresos: () => void;
};

export function TableEgresos({ egresos, isLoading, refetchEgresos }: Props) {
  const [viewEgresoModal, setViewEgresoModal] = useState(false);
  const [editingEgreso, setEditingEgreso] = useState<Egresos | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para preview de factura
  const [previewFactura, setPreviewFactura] = useState<{
    url: string;
    nombre: string;
  } | null>(null);

  const handleEdit = (egreso: Egresos) => {
    setEditingEgreso(egreso);
    setViewEgresoModal(true);
  };

  // Extraer el path del archivo de la URL de Supabase
  const getStoragePathFromUrl = (url: string): string | null => {
    try {
      // URL formato: https://xxx.supabase.co/storage/v1/object/public/facturas/egresos/archivo.ext
      const match = url.match(/\/facturas\/(.+)$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    setIsDeleting(true);

    try {
      // Buscar el egreso para obtener la factura_url
      const egresoToDelete = egresos.find((e) => e.id === id);

      // Si tiene factura, eliminarla del storage primero
      if (egresoToDelete?.factura_url) {
        const filePath = getStoragePathFromUrl(egresoToDelete.factura_url);

        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("facturas")
            .remove([filePath]);

          if (storageError) {
            console.error(
              "Error al eliminar factura del storage:",
              storageError
            );
            // Continuar aunque falle la eliminación del storage
          }
        }
      }

      // Eliminar el registro de la base de datos
      const { error } = await supabase.from("Egresos").delete().eq("id", id);

      if (!error) {
        refetchEgresos();
      }
    } catch (error) {
      console.error("Error al eliminar egreso:", error);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmId(null);
    }
  };

  // Manejar click en fila
  const handleRowClick = (egreso: Egresos) => {
    if (egreso.factura_url) {
      setPreviewFactura({
        url: egreso.factura_url,
        nombre: egreso.Descripcion || egreso.categoria || "Factura",
      });
    }
  };

  // Determinar si es PDF o imagen
  const isPDF = (url: string) => url.toLowerCase().endsWith(".pdf");

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <div className="flex justify-between p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Egresos</h3>
        <button
          type="button"
          className="text-lg font-semibold text-gray-800 border border-gray-300 rounded-lg px-3 hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            setEditingEgreso(null);
            setViewEgresoModal(true);
          }}
        >
          Agregar Egreso
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b text-gray-700">
              <th className="text-left p-3">Categoria</th>
              <th className="text-left p-3">Subcategoria</th>
              <th className="text-left p-3">Descripción</th>
              <th className="text-left p-3">Usuario</th>
              <th className="text-right p-3">Monto</th>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Factura</th>
              <th className="text-left p-3">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={8} className="p-4 text-gray-500">
                  Cargando...
                </td>
              </tr>
            )}

            {!isLoading && egresos.length === 0 && (
              <tr>
                <td colSpan={8} className="p-4 text-gray-500">
                  No hay egresos
                </td>
              </tr>
            )}

            {!isLoading &&
              egresos.map((item, i) => (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className={`border-b hover:bg-gray-50 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  } ${item.factura_url ? "cursor-pointer" : ""}`}
                >
                  <td className="p-3">{item.categoria || "-"}</td>
                  <td className="p-3">{item.subcategoria || "-"}</td>
                  <td className="p-3">{item.Descripcion || "-"}</td>
                  <td className="p-3">{item.profiles?.nombre || "-"}</td>
                  <td className="text-right font-semibold text-red-600 p-3">
                    {item.divisa} ${Number(item.Egreso || 0).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    {item.factura_url ? (
                      <span className="inline-flex items-center gap-1 text-blue-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span className="text-xs">Ver</span>
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">Sin factura</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Botón Editar */}
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          <path d="m15 5 4 4" />
                        </svg>
                      </button>

                      {/* Botón Eliminar */}
                      {deleteConfirmId === item.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            disabled={isDeleting}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {isDeleting ? "..." : "Sí"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-2 py-1 text-xs bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(item.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Eliminar"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            <line x1="10" x2="10" y1="11" y2="17" />
                            <line x1="14" x2="14" y1="11" y2="17" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Modal Agregar/Editar */}
      {viewEgresoModal && (
        <ModalAgregarEgreso
          onClose={() => {
            setViewEgresoModal(false);
            setEditingEgreso(null);
          }}
          refetchEgresos={refetchEgresos}
          egresoToEdit={editingEgreso}
        />
      )}

      {/* Modal Preview Factura */}
      {previewFactura && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setPreviewFactura(null)}
        >
          <div
            className="bg-white w-full max-h-[90vh] rounded-2xl shadow-xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {previewFactura.nombre}
              </h3>
              <div className="flex items-center gap-2">
                <a
                  href={previewFactura.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Abrir en nueva pestaña"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" x2="21" y1="14" y2="3" />
                  </svg>
                </a>
                <button
                  onClick={() => setPreviewFactura(null)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-4 bg-gray-100 flex items-center justify-center min-h-[400px]">
              {isPDF(previewFactura.url) ? (
                <iframe
                  src={previewFactura.url}
                  className="w-full h-[70vh] rounded-lg border"
                  title="Preview PDF"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewFactura.url}
                  alt="Factura"
                  className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
