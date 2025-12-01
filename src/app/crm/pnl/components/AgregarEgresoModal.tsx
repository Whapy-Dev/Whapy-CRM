"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEmplooyes } from "@/hooks/admin/useEmployees";
import { argentinaNow } from "./AgregarIngresoModal";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  onClose: () => void;
  refetchEgresos: () => void;
};

export function ModalAgregarEgreso({ onClose, refetchEgresos }: Props) {
  const { user } = useAuth();
  const { data: dataProfiles = [], isLoading } = useEmplooyes();

  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [userId, setUserId] = useState("");
  const [userNombre, setUserNombre] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // ✅ cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200">
          <div>Cargando...</div>
        </div>
      </div>
    );

  // ✅ Filtrar por nombre según el input interno del select
  const filtrados = dataProfiles.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  async function agregarEgreso() {
    const supabase = createClient();
    if (!descripcion.trim() || monto <= 0) return;

    try {
      const { error } = await supabase.from("Egresos").insert({
        user_id: userId || null,
        Egreso: monto,
        Descripcion: descripcion,
        created_at: new Date(argentinaNow).toISOString(),
      });

      if (error) throw error;
      const { error: errorHistory } = await supabase
        .from("historial_actividad")
        .insert([
          {
            usuario_modificador_id: user?.id,
            accion: "Añadió un egreso",
            usuario_modificado: userNombre,
            seccion: "PNL",
          },
        ]);

      if (errorHistory) throw errorHistory;
      setMonto(0);
      setDescripcion("");
      setUserId("");
      setBusqueda("");
      await refetchEgresos();
      onClose();
    } catch (error) {
      console.error("Error al agregar egreso:", error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Agregar Egreso</h2>

        {/* ✅ SELECT CUSTOM */}
        <div className="relative w-full mb-3">
          <button
            ref={btnRef}
            onClick={() => setOpen(!open)}
            className="w-full border border-gray-300 rounded-lg p-2 text-left bg-white flex justify-between items-center"
          >
            <span>
              {dataProfiles.find((p) => p.id === user)?.nombre ||
                "Seleccionar usuario"}
            </span>
            <span className="text-gray-400 text-sm">▼</span>
          </button>

          {open && (
            <div
              ref={ref}
              className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-2"
            >
              {/* ✅ Buscador dentro del select */}
              <input
                autoFocus
                type="text"
                placeholder="Buscar usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mb-2"
              />

              <div className="max-h-48 overflow-y-auto space-y-1">
                {filtrados.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setUserNombre(p.nombre);
                      setUserId(p.id);
                      setOpen(false);
                      setBusqueda("");
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-gray-100 rounded-lg"
                  >
                    {p.nombre}
                  </button>
                ))}

                {filtrados.length === 0 && (
                  <div className="px-3 py-1 text-gray-500 text-sm">
                    No se encontraron usuarios
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {/* ✅ FIN SELECT CUSTOM */}

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
          <input
            type="number"
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={agregarEgreso}
            disabled={!descripcion.trim() || monto <= 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400 cursor-pointer"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
