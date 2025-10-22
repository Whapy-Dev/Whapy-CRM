"use client";

import {
  Download,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

type Budget = {
  id: string;
  title: string;
  version: number;
  amount: number;
  status: "presentado" | "en_revision" | "aceptado" | "rechazado";
  created_at: string;
  pdf_url: string;
  description: string;
};

export default function PortalBudgetsPage() {
  const [budgets] = useState<Budget[]>([
    {
      id: "1",
      title: "Propuesta Comercial - Desarrollo Web",
      version: 1,
      amount: 150000,
      status: "presentado",
      created_at: "2025-10-16T10:00:00Z",
      pdf_url: "#",
      description:
        "Desarrollo de sitio web corporativo con panel de administración",
    },
    {
      id: "2",
      title: "Propuesta Comercial - App Mobile",
      version: 2,
      amount: 220000,
      status: "en_revision",
      created_at: "2025-10-10T14:30:00Z",
      pdf_url: "#",
      description: "Aplicación móvil iOS y Android para gestión de inventario",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);

  const statusConfig = {
    presentado: {
      color: "bg-blue-100 text-blue-800",
      icon: <FileText className="w-5 h-5" />,
      label: "Presentado",
      description: "Hemos enviado el presupuesto para tu revisión",
    },
    en_revision: {
      color: "bg-yellow-100 text-yellow-800",
      icon: <Clock className="w-5 h-5" />,
      label: "En Revisión",
      description: "Estamos esperando tu feedback",
    },
    aceptado: {
      color: "bg-green-100 text-green-800",
      icon: <CheckCircle className="w-5 h-5" />,
      label: "Aceptado",
      description: "¡Genial! Comenzaremos el proyecto pronto",
    },
    rechazado: {
      color: "bg-red-100 text-red-800",
      icon: <FileText className="w-5 h-5" />,
      label: "Rechazado",
      description: "No hubo acuerdo en esta oportunidad",
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleAccept = (budget: Budget) => {
    setSelectedBudget(budget);
    setShowModal(true);
  };

  const confirmAccept = () => {
    console.log("Presupuesto aceptado:", selectedBudget?.id);
    setShowModal(false);
    setSelectedBudget(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Presupuestos</h1>
        <p className="mt-2 text-gray-600">
          Revisa y gestiona las propuestas comerciales de tus proyectos
        </p>
      </div>

      {/* Presupuestos List */}
      <div className="space-y-6">
        {budgets.map((budget) => (
          <div
            key={budget.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            {/* Header del presupuesto */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {budget.title}
                    </h2>
                    <span className="text-sm text-gray-500">
                      v{budget.version}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{budget.description}</p>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        statusConfig[budget.status].color
                      }`}
                    >
                      {statusConfig[budget.status].icon}
                      {statusConfig[budget.status].label}
                    </span>
                    <span className="text-sm text-gray-500">
                      Enviado el{" "}
                      {new Date(budget.created_at).toLocaleDateString("es-AR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Monto Total</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(budget.amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Info del estado */}
            <div className="px-6 py-4 bg-gray-50">
              <p className="text-sm text-gray-600">
                {statusConfig[budget.status].description}
              </p>
            </div>

            {/* Acciones */}
            <div className="p-6 flex flex-wrap gap-3">
              <a
                href={budget.pdf_url}
                download
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </a>

              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Eye className="w-4 h-4" />
                Ver en línea
              </button>

              {(budget.status === "presentado" ||
                budget.status === "en_revision") && (
                <a
                  href=""
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ml-auto"
                >
                  <ThumbsUp className="w-4 h-4" />
                  Quiero Avanzar
                </a>
              )}
            </div>

            {/* Detalles adicionales */}
            <div className="px-6 pb-6">
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Detalles del Presupuesto
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Duración estimada</p>
                    <p className="font-medium text-gray-900">8-12 semanas</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Modalidad de pago</p>
                    <p className="font-medium text-gray-900">3 cuotas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {budgets.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay presupuestos disponibles
            </h3>
            <p className="text-gray-600">
              Los presupuestos aparecerán aquí una vez que sean enviados por
              nuestro equipo
            </p>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          ¿Tienes preguntas sobre el presupuesto?
        </h3>
        <p className="text-gray-700 mb-4">
          Estamos aquí para aclarar cualquier duda. No dudes en contactarnos.
        </p>
        <div className="flex gap-3">
          <a
            href="mailto:contacto@whapy.com"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enviar Email
          </a>
          <a
            href="https://wa.me/5491112345678"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showModal && selectedBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ThumbsUp className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Excelente decisión!
              </h2>
              <p className="text-gray-600">
                ¿Confirmas que deseas avanzar con el presupuesto "
                {selectedBudget.title}"?
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Monto total:</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(selectedBudget.amount)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Nuestro equipo se pondrá en contacto contigo en las próximas 24
                horas para coordinar los próximos pasos.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={confirmAccept}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
