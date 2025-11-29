"use client";

import { useState } from "react";
import { ModalAgregarEgreso } from "./AgregarEgresoModal";
import { ModalAgregarIngreso } from "./AgregarIngresoModal";

type Ingresos = {
  id: string;
  projects?: {
    title: string;
  };
  Ingreso?: number;
  Descripcion?: string;
  created_at: string;
};

type Props = {
  ingresos: Ingresos[];
  isLoading: boolean;
  refetchIngresos: () => void;
};

export function TableIngresos({ ingresos, isLoading, refetchIngresos }: Props) {
  const [viewIngresoModal, setViewIngresoModal] = useState(false);
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
      <div className="flex justify-between p-4 border-b bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800">Ingresos</h3>
        <button
          type="button"
          className="text-lg font-semibold text-gray-800 border border-gray-300 rounded-lg px-3 hover:bg-gray-100 cursor-pointer"
          onClick={() => setViewIngresoModal(true)}
        >
          Agregar Ingreso
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b text-gray-700">
              <th className="text-left p-3">Proyecto</th>
              <th className="text-left p-3">Descripción</th>
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

            {!isLoading && ingresos.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-gray-500">
                  No hay ingresos
                </td>
              </tr>
            )}

            {!isLoading &&
              ingresos.map((item, i) => (
                <tr
                  key={item.id}
                  className={`border-b hover:bg-gray-50 transition ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <td className="p-3">{item.projects?.title || "-"}</td>
                  <td className="p-3">{item.Descripcion || "-"}</td>
                  <td className="text-right font-semibold text-green-600 p-3">
                    ${Number(item.Ingreso || 0).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {viewIngresoModal && (
        <ModalAgregarIngreso
          onClose={() => setViewIngresoModal(false)}
          refetchIngresos={refetchIngresos}
        />
      )}
    </div>
  );
}
