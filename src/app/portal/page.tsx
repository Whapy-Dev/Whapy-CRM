"use client";

import {
  Calendar,
  FileText,
  Download,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function PortalDashboard() {
  const clientData = {
    name: "Juan Pérez",
    company: "Tech Solutions",
    nextMeeting: {
      title: "Presentación de Presupuesto",
      date: "2025-10-21T15:00:00Z",
      meet_url: "https://meet.google.com/abc-defg-hij",
    },
    budgetStatus: "presentado",
    recentDocuments: [
      {
        id: "1",
        title: "Resumen Primera Reunión",
        type: "reunion",
        date: "2025-10-15",
        url: "#",
      },
      {
        id: "2",
        title: "Propuesta Comercial v1",
        type: "presupuesto",
        date: "2025-10-16",
        url: "#",
      },
    ],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("es-AR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const nextMeeting = formatDate(clientData.nextMeeting.date);

  return (
    <div className="space-y-6">
      {/* Bienvenida */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          ¡Hola, {clientData.name}! 👋
        </h1>
        <p className="text-blue-100 text-lg">
          Bienvenido a tu portal personalizado de Whapy LLC
        </p>
      </div>

      {/* Próxima reunión destacada */}
      {clientData.nextMeeting && (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                  Próxima Reunión
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {clientData.nextMeeting.title}
              </h2>
              <div className="flex flex-col gap-1 text-gray-600">
                <p className="capitalize">{nextMeeting.date}</p>
                <p className="text-lg font-semibold text-gray-900">
                  {nextMeeting.time}
                </p>
              </div>
            </div>
            <a
              href={clientData.nextMeeting.meet_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Unirse ahora
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* Estado del proyecto */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Estado del Presupuesto
          </h3>
          <p className="text-2xl font-bold text-gray-900">Presentado</p>
          <p className="text-sm text-gray-500 mt-2">
            En revisión por tu equipo
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Documentos</h3>
          <p className="text-2xl font-bold text-gray-900">
            {clientData.recentDocuments.length}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Disponibles para descargar
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">
            Tiempo de Respuesta
          </h3>
          <p className="text-2xl font-bold text-gray-900">&lt; 24h</p>
          <p className="text-sm text-gray-500 mt-2">Promedio de respuesta</p>
        </div>
      </div>

      {/* Documentos recientes */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Documentos Recientes
          </h2>
        </div>
        <div className="divide-y divide-gray-200">
          {clientData.recentDocuments.map((doc) => (
            <div
              key={doc.id}
              className="p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="capitalize">
                        {doc.type === "reunion"
                          ? "Resumen de Reunión"
                          : "Presupuesto"}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(doc.date).toLocaleDateString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>
                <a
                  href={doc.url}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximos pasos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Pasos</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Revisar el presupuesto presentado
              </h3>
              <p className="text-sm text-gray-600">
                Toma tu tiempo para revisar todos los detalles de la propuesta
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Asistir a la reunión de presentación
              </h3>
              <p className="text-sm text-gray-600">
                Resolveremos todas tus dudas en la próxima videollamada
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">
                Confirmar si deseas avanzar
              </h3>
              <p className="text-sm text-gray-600">
                Puedes hacerlo desde el botón en la sección de presupuestos
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA de contacto */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 text-center">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          ¿Tienes alguna pregunta?
        </h3>
        <p className="text-gray-600 mb-4">
          Estamos aquí para ayudarte en cada paso del proceso
        </p>
        <a
          href="mailto:contacto@whapy.com"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
        >
          Contactar al equipo
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
