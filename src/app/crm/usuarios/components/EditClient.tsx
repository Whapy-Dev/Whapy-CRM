"use client";

import { useState, useEffect } from "react";
import { Client } from "../page";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
function formatDate(dateString: string) {
  if (!dateString) return "";

  // Si viene como YYYY-MM-DD → ya sirve para input type="date"
  if (dateString.includes("-")) {
    return dateString;
  }

  // Si viene como DD/MM/YYYY
  const parts = dateString.split("/");
  if (parts.length !== 3) return ""; // evitar errores

  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

type ClientEditModalProps = {
  show: boolean;
  client: Client | null;
  onClose: () => void;
  refetchProfile: () => void;
};

const supabase = createClient();

export default function ShowEditClientModal({
  show,
  client,
  onClose,
  refetchProfile,
}: ClientEditModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    ciudad: "",
    codigoPostal: "",
    type: "",
    genero: "",
    fechaNacimiento: "",
    pais: "",
    detalles: "",
  });

  useEffect(() => {
    if (client) {
      setFormData({
        nombre: client.nombre || "",
        email: client.email || "",
        telefono: client.telefono || "",
        empresa: client.empresa || "",
        ciudad: client.ciudad || "",
        codigoPostal: client.codigoPostal || "",
        type: client.type || "",
        genero: client.genero || "",
        fechaNacimiento: client.fechaNacimiento
          ? formatDate(client.fechaNacimiento)
          : "",
        pais: client.pais || "",
        detalles: client.detalles || "",
      });
    }
  }, [client]);

  if (!show || !client) return null;
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!client?.id) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        nombre: formData.nombre,
        telefono: formData.telefono,
        empresa: formData.empresa,
        ciudad: formData.ciudad,
        codigoPostal: formData.codigoPostal,
        type: formData.type,
        genero: formData.genero,
        fechaNacimiento: formData.fechaNacimiento,
        pais: formData.pais,
        detalles: formData.detalles,
      })
      .eq("id", client.id);

    if (error) {
      console.error("Error actualizando cliente:", error);
      return;
    }
    const { error: errorDb } = await supabase
      .from("historial_actividad")
      .insert([
        {
          usuario_modificador_id: user?.id,
          accion: "Editó los datos de un cliente",
          usuario_modificado: client?.nombre,
          seccion: "Usuarios",
        },
      ]);

    if (errorDb) throw errorDb;
    if (!error) {
      await refetchProfile();

      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        empresa: "",
        ciudad: "",
        codigoPostal: "",
        type: "",
        genero: "",
        fechaNacimiento: "",
        pais: "",
        detalles: "",
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-5xl overflow-y-auto max-h-[90vh] shadow-2xl border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Editar Cliente
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800"
        >
          <div className="flex flex-col">
            <label className="mb-1 font-medium">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              className="border p-2 rounded-lg w-full"
              readOnly
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Empresa</label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Ciudad</label>
            <input
              type="text"
              name="ciudad"
              value={formData.ciudad}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Código Postal</label>
            <input
              type="text"
              name="codigoPostal"
              value={formData.codigoPostal}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Tipo</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            >
              <option value="">Seleccione un tipo de cliente</option>
              <option value="Cliente">Cliente</option>
              <option value="Lead">Lead</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Género</label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            >
              <option value="">Seleccione un género</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">Fecha de Nacimiento</label>
            <input
              type="date"
              name="fechaNacimiento"
              value={formData.fechaNacimiento}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-medium">País</label>
            <input
              type="text"
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
            />
          </div>

          <div className="flex flex-col sm:col-span-2">
            <label className="mb-1 font-medium">Detalles</label>
            <textarea
              name="detalles"
              value={formData.detalles}
              onChange={handleChange}
              className="border p-2 rounded-lg w-full"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 sm:col-span-2">
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
