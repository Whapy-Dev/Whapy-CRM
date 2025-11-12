"use client";

import { useState } from "react";
import { Client, Project } from "../page";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle } from "lucide-react";

type AssignPresupuestoModalProps = {
  show: boolean;
  client: Client | null;
  project: Project | null;
  onClose: () => void;
};
const supabase = createClient();
export default function AssignPresupuestoModal({
  show,
  client,
  project,
  onClose,
}: AssignPresupuestoModalProps) {
  const [status, setStatus] = useState("");
  const [title, setTitle] = useState("");
  const [amountTotal, setAmountTotal] = useState("");
  const [duracionEstimada, setDuracionEstimada] = useState("");
  const [modalidadPago, setModalidadPago] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [currency, setCurrency] = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNewPresupuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorForm("");
    setLoading(true);
    setSuccess(false);

    try {
      // Validaciones básicas
      if (
        !title ||
        !amountTotal ||
        !status ||
        !duracionEstimada ||
        !modalidadPago
      ) {
        setErrorForm("Por favor, completa todos los campos obligatorios.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.from("budgets").insert([
        {
          user_id: client?.id,
          project_id: project?.id,
          title: title,
          status: status,
          amount_total: Number(amountTotal),
          duracion_estimada: duracionEstimada,
          modalidad_pago: modalidadPago,
          pdf_url: pdfUrl || null,
          currency: currency || "USD",
        },
      ]);

      if (error) {
        console.error(error);
        setErrorForm("Error al crear presupuesto");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      setStatus("");
      setTitle("");
      setAmountTotal("");
      setDuracionEstimada("");
      setModalidadPago("");
      setPdfUrl("");
      setCurrency("");
      onClose();
    } catch (err) {
      console.error("Error al crear nuevo Presupuesto:", err);
      setErrorForm("Ocurrió un error inesperado. Intenta nuevamente.");
      setLoading(false);
    }
  };
  if (!show || !client) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Nuevo Presupuesto</h2>
        <form onSubmit={handleNewPresupuesto} className="space-y-4">
          {/* Error */}
          {errorForm && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errorForm}</p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                Presupuesto creado con éxito
              </p>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Presupuesto web corporativa"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecciona estado</option>
              <option value="en revision">en revision</option>
              <option value="presentado">presentado</option>
              <option value="aceptado">aceptado</option>
              <option value="rechazado">rechazado</option>
            </select>
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto total
            </label>
            <input
              type="number"
              value={amountTotal}
              onChange={(e) => setAmountTotal(e.target.value)}
              placeholder="3000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duracion Estimada
            </label>
            <input
              type="text"
              value={duracionEstimada}
              onChange={(e) => setDuracionEstimada(e.target.value)}
              placeholder="2-3 semanas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modalidad de Pago
            </label>
            <input
              type="text"
              value={modalidadPago}
              onChange={(e) => setModalidadPago(e.target.value)}
              placeholder="6 cuotas"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del PDF (opcional)
            </label>
            <input
              type="text"
              value={pdfUrl}
              onChange={(e) => setPdfUrl(e.target.value)}
              placeholder="https://tuarchivo.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Moneda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Moneda (opcional)
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="USD"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${
                loading ? "cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Creando..." : "Crear Presupuesto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
