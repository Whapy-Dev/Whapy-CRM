"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProjectsUser } from "@/hooks/user/projectsUser";
import { Download, Eye, FileText, Calendar, X } from "lucide-react";
import type { Document, Project } from "@/app/crm/usuarios/page";

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

  const categories = [
    "Todos",
    "Presupuestos",
    "Contratos",
    "Diseño",
    "Repositorio",
    "Accesos",
    "Otros Recursos",
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Diseño: "bg-green-100 text-green-800",
      Presupuestos: "bg-yellow-100 text-yellow-800",
      Contratos: "bg-rose-100 text-rose-800",
      Repositorio: "bg-sky-100 text-sky-800",
      Accesos: "bg-indigo-100 text-indigo-800",
      "Otros Recursos": "bg-gray-100 text-gray-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type: string) => {
    if (type === "PDF") return <FileText className="w-5 h-5 text-red-600" />;
    return <FileText className="w-5 h-5 text-gray-600" />;
  };

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
          <ProjectCard
            key={project.id}
            project={project}
            categories={categories}
            getTypeIcon={getTypeIcon}
            getCategoryColor={getCategoryColor}
          />
        ))}
        {projectsData.every(
          (p) => !p.documents || p.documents.length === 0
        ) && (
          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-600 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm">
            <FileText className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              No hay documentos disponibles
            </h3>
            <p className="text-sm text-gray-500 max-w-md">
              Aún no se han subido documentos a tus proyectos. Cuando se
              agreguen, aparecerán aquí para que puedas verlos o descargarlos.
            </p>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-blue-50 rounded-lg p-6 mt-10">
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

// --- COMPONENTE DE CADA PROYECTO ---
function ProjectCard({
  project,
  categories,
  getTypeIcon,
  getCategoryColor,
}: {
  project: Project;
  categories: string[];
  getTypeIcon: (type: string) => JSX.Element;
  getCategoryColor: (cat: string) => string;
}) {
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const filteredDocs =
    selectedCategory === "Todos"
      ? project.documents
      : project.documents?.filter(
          (doc: Document) => doc.category_document === selectedCategory
        );

  return (
    <div className="border border-gray-200 rounded-2xl p-6 shadow-sm bg-white relative">
      {/* Modal PDF */}
      {pdfUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg relative w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">
                Vista previa del documento
              </h3>
              <button
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                onClick={() => setPdfUrl(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={pdfUrl}
                className="w-full h-full rounded-lg border"
                title="Vista previa del PDF"
              />
            </div>
          </div>
        </div>
      )}

      {/* Nombre del proyecto */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        {project.title}
      </h2>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Documentos filtrados */}
      {!filteredDocs || filteredDocs.length === 0 ? (
        <p className="text-gray-500 text-sm">
          No hay documentos en esta categoría.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc: Document) => (
            <div
              key={doc.id}
              className="flex flex-col border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(doc.type_document)}
                  <h3 className="font-medium text-gray-800 line-clamp-1">
                    {doc.title}
                  </h3>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                    doc.category_document
                  )}`}
                >
                  {doc.category_document}
                </span>
              </div>

              <div className="flex items-center text-xs text-gray-400 gap-1 mb-3">
                <Calendar className="w-4 h-4" />
                {new Date(doc.created_at).toLocaleDateString("es-AR")}
              </div>

              <div className="flex justify-between mt-auto">
                <button
                  onClick={() => setPdfUrl(doc.document_url)}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 text-sm"
                >
                  <Eye className="w-4 h-4 mr-1" /> Ver
                </button>

                <a
                  href={doc.document_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
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
  );
}
