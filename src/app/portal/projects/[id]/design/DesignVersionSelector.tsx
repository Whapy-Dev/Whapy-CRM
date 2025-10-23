"use client";

import { useState } from "react";
import { ExternalLink, Maximize2, Clock } from "lucide-react";

type DesignVersion = {
  id: string;
  version: string;
  title: string;
  figma_url: string;
  updated_at: string;
  description: string;
  is_current: boolean;
};

type Props = {
  versions: DesignVersion[];
  projectId: string;
};

export default function DesignVersionSelector({ versions }: Props) {
  const [selectedVersion, setSelectedVersion] = useState(versions[0]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Current Version Banner */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-white bg-opacity-20 rounded text-sm font-medium">
                Versión Actual
              </span>
              <span className="text-xl font-bold">
                {selectedVersion.version}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-2">{selectedVersion.title}</h2>
            <p className="text-green-100">{selectedVersion.description}</p>
            <p className="text-sm text-green-100 mt-2">
              Actualizado: {formatDate(selectedVersion.updated_at)}
            </p>
          </div>
          <a
            href={selectedVersion.figma_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white text-green-600 rounded-lg hover:bg-green-50 font-medium transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Abrir en Figma
          </a>
        </div>
      </div>

      {/* Figma Embed */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-gray-700"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M8 2C6.895 2 6 2.895 6 4v16c0 1.105.895 2 2 2s2-.895 2-2V4c0-1.105-.895-2-2-2zm8 0c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2s2-.895 2-2V4c0-1.105-.895-2-2-2zm0 12c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zM8 10c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" />
            </svg>
            <div>
              <h3 className="font-medium text-gray-900">
                Vista Previa del Diseño
              </h3>
              <p className="text-sm text-gray-500">
                Interactúa con el prototipo directamente
              </p>
            </div>
          </div>
          <a
            href={selectedVersion.figma_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
            Ver pantalla completa
          </a>
        </div>

        {/* Figma iframe */}
        <div
          className="relative"
          style={{ paddingBottom: "56.25%", height: 0 }}
        >
          <iframe
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              border: "none",
            }}
            src={`${selectedVersion.figma_url}/embed`}
            allowFullScreen
          ></iframe>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Historial de Versiones
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Todas las iteraciones del diseño
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {versions.map((version) => (
            <div
              key={version.id}
              onClick={() => setSelectedVersion(version)}
              className={`p-6 cursor-pointer transition-colors ${
                selectedVersion.id === version.id
                  ? "bg-blue-50 border-l-4 border-blue-600"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        version.is_current
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {version.version}
                    </span>
                    {version.is_current && (
                      <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-medium">
                        ACTUAL
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {version.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{version.description}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {formatDate(version.updated_at)}
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedVersion.id === version.id && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                      Visualizando
                    </span>
                  )}
                  <a
                    href={version.figma_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Abrir
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          💡 Cómo usar el prototipo
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Haz clic en los elementos interactivos para navegar por el
              prototipo
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Usa el botón &quot;Ver pantalla completa&quot; para una mejor
              experiencia
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Puedes dejar comentarios directamente en Figma si tienes una
              cuenta
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Cualquier duda o sugerencia, no dudes en contactarnos</span>
          </li>
        </ul>
      </div>
    </>
  );
}
