"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  onClose: () => void;
};

export function ModalAgregarEgreso({ onClose }: Props) {
  const [tipo, setTipo] = useState("");
  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState("");

  const supabase = createClient();

  // ✅ Ahora la función de agregar está dentro del modal
  async function agregarEgreso() {
    const { error } = await supabase.from("Egresos").insert({
      tipo: tipo,
      monto: monto,
      descripcion: descripcion,
    });

    if (error) {
      console.error("Error al agregar egreso:", error);
      return;
    }

    console.log("Egreso agregado correctamente");
    onClose(); // cierra el modal cuando termina
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Agregar Egreso</h2>

        <div className="space-y-3">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="">Seleccionar tipo</option>
            <option value="Sueldos">Sueldos</option>
            <option value="Software">Software</option>
            <option value="Servicios">Servicios</option>
            <option value="Otros">Otros</option>
          </select>

          <input
            type="number"
            placeholder="Monto"
            value={monto}
            onChange={(e) => setMonto(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
          />

          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={agregarEgreso}
            disabled={!tipo || monto <= 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
