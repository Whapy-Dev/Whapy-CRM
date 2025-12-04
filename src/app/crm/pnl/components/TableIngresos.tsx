"use client";

import { useState } from "react";
import { ModalAgregarIngreso } from "./AgregarIngresoModal";

type Ingresos = {
  id: string;
  nombre: string;
  presupuesto_id: string;
  Ingreso?: number;
  Descripcion?: string;
  categoria: string;
  subcategoria: string;
  created_at: string;
  recurrente: string;
  divisa: string;
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
              <th className="text-left p-3">Categoria</th>
              <th className="text-left p-3">Subcategoria</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Descripción</th>
              <th className="text-right p-3">Monto</th>
              <th className="text-left p-3">Fecha</th>
              <th className="text-left p-3">Recurrente</th>
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
                  <td className="p-3">{item.categoria || "-"}</td>
                  <td className="p-3">{item.subcategoria || "-"}</td>
                  <td className="p-3">{item.nombre || "-"}</td>
                  <td className="p-3">{item.Descripcion || "-"}</td>
                  <td className="text-right font-semibold text-green-600 p-3">
                    {item.divisa} ${Number(item.Ingreso || 0).toLocaleString()}
                  </td>
                  <td className="p-3">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">{item.recurrente || "-"}</td>
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
