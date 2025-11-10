"use client";

import { Document, Project } from "@/app/crm/usuarios/page";
import { useAuth } from "@/hooks/useAuth";
import { useProjectsUser } from "@/hooks/user/projectsUser";
import { Download, Eye, FileText, Calendar } from "lucide-react";

export default function PortalBudgetsPage() {
  const { user, loading } = useAuth();
  const {
    data: projectsData = [],
    isLoading: isLoadingProjects,
    error: errorProjects,
  } = useProjectsUser(user);

  if (loading) return <p>Cargando usuario...</p>;
  if (isLoadingProjects) return <p>Cargando proyectos...</p>;
  if (errorProjects) return <p>Error: {errorProjects.message}</p>;
  if (!isLoadingProjects && projectsData.length === 0)
    return <p>No hay proyectos disponibles</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mis Documentos</h1>
        <p className="mt-2 text-gray-600">
          Revisa y gestiona los documentos comerciales de tus proyectos
        </p>
      </div>

      {/* Lista de proyectos */}
      <div className="space-y-8">
        {projectsData.map((project: Project) => (
          <div
            key={project.id}
            className="border border-gray-200 rounded-2xl p-6 shadow-sm bg-white"
          >
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {project.title}
            </h2>

            {!project.documents || project.documents.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Este proyecto no tiene documentos aún.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.documents.map((doc: Document) => (
                  <div
                    key={doc.id}
                    className="flex flex-col border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-medium text-gray-800">{doc.title}</h3>
                    </div>

                    <p className="text-sm text-gray-500 mb-3">
                      {doc.category_document}
                    </p>

                    <div className="flex items-center text-xs text-gray-400 gap-1 mb-3">
                      <Calendar className="w-4 h-4" />
                      {new Date(doc.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex justify-between mt-auto">
                      <a
                        href={doc.document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Ver
                      </a>

                      <a
                        href={doc.document_url}
                        download
                        className="flex items-center text-green-600 hover:text-green-800 text-sm"
                      >
                        <Download className="w-4 h-4 mr-1" /> Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          ¿Tienes preguntas sobre un documento?
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
            href="https://wa.me/5493442310408"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
