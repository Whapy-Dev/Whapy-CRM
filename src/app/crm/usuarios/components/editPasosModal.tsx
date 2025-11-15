"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "../page";
import { useQueryClient } from "@tanstack/react-query";

type ClientStepsEditModalProps = {
  show: boolean;
  client: Client | null;
  onClose: () => void;
  refetchProfiles: () => void;
};

const supabase = createClient();

export default function EditClientStepsModal({
  show,
  client,
  onClose,
  refetchProfiles,
}: ClientStepsEditModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    titulo1: "",
    detalles1: "",
    titulo2: "",
    detalles2: "",
    titulo3: "",
    detalles3: "",
  });

  useEffect(() => {
    if (!client) return;

    // Si el cliente tiene pasos, los cargamos al form
    if (client.pasos && client.pasos.length > 0) {
      const pasos = client.pasos[0]; // asumimos un registro por cliente
      setFormData({
        titulo1: pasos.paso_titulo_1 || "",
        detalles1: pasos.paso_detalle_1 || "",
        titulo2: pasos.paso_titulo_2 || "",
        detalles2: pasos.paso_detalle_2 || "",
        titulo3: pasos.paso_titulo_3 || "",
        detalles3: pasos.paso_detalle_3 || "",
      });
    } else {
      // Si no tiene pasos, dejamos el form vacío
      setFormData({
        titulo1: "",
        detalles1: "",
        titulo2: "",
        detalles2: "",
        titulo3: "",
        detalles3: "",
      });
    }
  }, [client]);

  if (!show || !client) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client?.id) return;

    if (client.pasos && client.pasos.length > 0) {
      const pasoExistente = client.pasos[0];

      const { error } = await supabase
        .from("pasos")
        .update({
          paso_titulo_1: formData.titulo1,
          paso_detalle_1: formData.detalles1,
          paso_titulo_2: formData.titulo2,
          paso_detalle_2: formData.detalles2,
          paso_titulo_3: formData.titulo3,
          paso_detalle_3: formData.detalles3,
        })
        .eq("id", pasoExistente.id);

      if (error) {
        console.error("Error actualizando pasos:", error);
        alert("Error al actualizar los pasos.");
        return;
      }

      alert("Pasos actualizados correctamente.");
    } else {
      // Si no tiene pasos, creamos una nueva fila
      const { error } = await supabase.from("pasos").insert([
        {
          user_id: client.id,
          paso_titulo_1: formData.titulo1,
          paso_detalle_1: formData.detalles1,
          paso_titulo_2: formData.titulo2,
          paso_detalle_2: formData.detalles2,
          paso_titulo_3: formData.titulo3,
          paso_detalle_3: formData.detalles3,
        },
      ]);

      if (error) {
        console.error("Error creando pasos:", error);
        alert("Error al crear los pasos.");
        return;
      }
    }

    await refetchProfiles();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-3xl overflow-y-auto max-h-[90vh] shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Editar Próximos Pasos
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="border rounded-xl p-4 bg-gray-50 shadow-sm space-y-2"
            >
              <label className="block font-medium text-gray-700">
                Título del paso {num}
              </label>
              <input
                type="text"
                name={`titulo${num}`}
                value={formData[`titulo${num}` as keyof typeof formData]}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
              />

              <label className="block font-medium text-gray-700">
                Detalles
              </label>
              <textarea
                name={`detalles${num}`}
                value={formData[`detalles${num}` as keyof typeof formData]}
                onChange={handleChange}
                className="border rounded-lg w-full p-2"
                rows={2}
              />
            </div>
          ))}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-2xl hover:bg-gray-400 font-medium cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-medium cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
