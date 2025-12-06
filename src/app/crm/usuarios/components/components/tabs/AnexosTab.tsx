// tabs/AnexosTab.tsx
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Anexo, formatCurrency } from "../types";
import { Project } from "@/utils/types";

interface AnexosTabProps {
  selectedProject: Project;
  anexos: Anexo[];
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refetchAnexos: () => Promise<void>;
}

export default function AnexosTab({
  selectedProject,
  anexos,
  loading,
  setLoading,
  refetchAnexos,
}: AnexosTabProps) {
  const supabase = createClient();
  const presupuesto = selectedProject.presupuesto;

  const [showAdd, setShowAdd] = useState(false);
  const [newAnexo, setNewAnexo] = useState<number | "">("");

  const agregarAnexo = async () => {
    if (!presupuesto?.id || newAnexo === "" || newAnexo < 0) return;

    setLoading(true);
    setShowAdd(false);

    try {
      await supabase.from("anexos").insert([
        {
          monto: newAnexo,
          presupuesto_id: presupuesto.id,
        },
      ]);

      await refetchAnexos();
      setNewAnexo("");
    } catch (error) {
      console.error("Error agregando anexo:", error);
    } finally {
      setLoading(false);
    }
  };

  const borrarAnexo = async (anexoId: string) => {
    if (!presupuesto?.id) return;

    const confirmDelete = window.confirm("¿Eliminar este anexo?");
    if (!confirmDelete) return;

    setLoading(true);

    try {
      await supabase.from("anexos").delete().eq("id", anexoId);
      await refetchAnexos();
    } catch (error) {
      console.error("Error borrando anexo:", error);
    } finally {
      setLoading(false);
    }
  };

  const borrarTodosLosAnexos = async () => {
    if (!presupuesto?.id) return;

    const confirmDelete = window.confirm("¿Eliminar TODOS los anexos?");
    if (!confirmDelete) return;

    setLoading(true);

    try {
      await supabase
        .from("anexos")
        .delete()
        .eq("presupuesto_id", presupuesto.id);
      await refetchAnexos();
    } catch (error) {
      console.error("Error borrando todos los anexos:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalAnexos = anexos.reduce((sum, a) => sum + a.monto, 0);

  if (!presupuesto) return null;

  return (
    <div className="space-y-4">
      {/* Resumen */}
      {anexos.length > 0 && (
        <div className="bg-blue-50 p-3 rounded-xl">
          <p className="text-sm text-blue-800">
            Total en anexos:{" "}
            <strong>{formatCurrency(totalAnexos, presupuesto.divisa)}</strong>
          </p>
        </div>
      )}

      {/* Lista de anexos */}
      <div className="grid grid-cols-2 gap-4">
        {anexos.map((ax, index) => (
          <div key={ax.id} className="border rounded-xl p-3 shadow-sm bg-white">
            <div className="flex justify-between items-start">
              <div>
                <h5 className="font-semibold">Anexo {index + 1}</h5>
                <p className="text-lg">
                  {formatCurrency(ax.monto, presupuesto.divisa)}
                </p>
              </div>
              <button
                onClick={() => borrarAnexo(ax.id)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition cursor-pointer"
                disabled={loading}
              >
                Borrar
              </button>
            </div>
          </div>
        ))}
      </div>

      {anexos.length === 0 && (
        <p className="text-gray-500 text-sm text-center py-4">
          No hay anexos creados
        </p>
      )}

      {/* Acciones */}
      {!showAdd ? (
        <div className="flex gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition cursor-pointer"
          >
            + Agregar anexo
          </button>
          {anexos.length > 0 && (
            <button
              onClick={borrarTodosLosAnexos}
              className="px-4 py-2 bg-red-700 text-white rounded-xl hover:bg-red-800 transition cursor-pointer"
              disabled={loading}
            >
              Borrar todos
            </button>
          )}
        </div>
      ) : (
        <div className="flex gap-2 items-end bg-gray-50 p-3 rounded-xl">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Monto del anexo</label>
            <input
              type="number"
              value={newAnexo}
              onChange={(e) => setNewAnexo(Number(e.target.value))}
              className="w-full border p-2 rounded-lg mt-1"
              placeholder="0"
              min={0}
            />
          </div>

          <button
            onClick={agregarAnexo}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            disabled={loading || newAnexo === "" || newAnexo <= 0}
          >
            Guardar
          </button>

          <button
            onClick={() => {
              setShowAdd(false);
              setNewAnexo("");
            }}
            className="px-3 py-2 border rounded-lg hover:bg-gray-100 transition cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
