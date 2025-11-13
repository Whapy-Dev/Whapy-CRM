// components/EditDetallesModal.tsx
"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Client } from "../page";
import { useQueryClient } from "@tanstack/react-query";

type EditDetallesModalProps = {
  show: boolean;
  client: Client;
  onClose: () => void;
  onUpdate: (newDetalles: string) => void;
  refetchProfiles: () => void;
};

export default function EditDetallesModal({
  show,
  client,
  onClose,
  onUpdate,
  refetchProfiles,
}: EditDetallesModalProps) {
  const queryClient = useQueryClient();
  const [detalles, setDetalles] = useState(client.detalles || "");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!show) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ detalles })
        .eq("id", client.id);

      if (error) throw error;

      onUpdate(detalles);

      await refetchProfiles();

      onClose();
    } catch (err) {
      console.error("Error actualizando detalles:", err);
      alert("Hubo un error al guardar los detalles.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-5xl h-[80vh] shadow-2xl border border-gray-200 flex flex-col">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          Editar Detalles
        </h2>
        <textarea
          value={detalles}
          onChange={(e) => setDetalles(e.target.value)}
          className="flex-grow w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-gray-800 text-base leading-relaxed"
          placeholder="Escribí los nuevos detalles del cliente..."
          style={{
            fontFamily: "Arial, sans-serif",
            backgroundColor: "#fafafa",
          }}
        />
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 font-medium cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
