"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  FileText,
  Eye,
  Folder,
  Calendar,
} from "lucide-react";

type Document = {
  id: string;
  name: string;
  type: "pdf" | "docx" | "xlsx" | "other";
  category: "resumen" | "contrato" | "entregable" | "otro";
  size: string;
  uploaded_at: string;
  url: string;
  description?: string;
};

export default function ProjectDocumentsPage({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  params,
}: {
  params: { id: string };
}) {
  const [documents] = useState<Document[]>([
    {
      id: "1",
      name: "Resumen Reunión Kickoff.pdf",
      type: "pdf",
      category: "resumen",
      size: "2.4 MB",
      uploaded_at: "2025-09-15T14:30:00Z",
      url: "#",
      description:
        "Resumen de la reunión inicial del proyecto con objetivos y alcance",
    },
    {
      id: "2",
      name: "Resumen Revisión Wireframes.pdf",
      type: "pdf",
      category: "resumen",
      size: "1.8 MB",
      uploaded_at: "2025-09-22T16:00:00Z",
      url: "#",
      description: "Validación de wireframes y ajustes acordados",
    },
    {
      id: "3",
      name: "Contrato de Servicios.pdf",
      type: "pdf",
      category: "contrato",
      size: "450 KB",
      uploaded_at: "2025-09-10T10:00:00Z",
      url: "#",
      description: "Contrato firmado con términos y condiciones del servicio",
    },
    {
      id: "4",
      name: "Especificaciones Técnicas.docx",
      type: "docx",
      category: "entregable",
      size: "3.2 MB",
      uploaded_at: "2025-09-18T11:30:00Z",
      url: "#",
      description:
        "Documento detallado con especificaciones técnicas del proyecto",
    },
    {
      id: "5",
      name: "Cronograma del Proyecto.xlsx",
      type: "xlsx",
      category: "otro",
      size: "180 KB",
      uploaded_at: "2025-09-12T09:00:00Z",
      url: "#",
      description: "Timeline detallado con hitos y entregables",
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const projectName = "Desarrollo Web Corporativo";

  const categoryConfig = {
    resumen: {
      label: "Resúmenes",
      color: "bg-blue-100 text-blue-800",
      count: 0,
    },
    contrato: {
      label: "Contratos",
      color: "bg-purple-100 text-purple-800",
      count: 0,
    },
    entregable: {
      label: "Entregables",
      color: "bg-green-100 text-green-800",
      count: 0,
    },
    otro: { label: "Otros", color: "bg-gray-100 text-gray-800", count: 0 },
  };

  const fileTypeIcons = {
    pdf: "📄",
    docx: "📝",
    xlsx: "📊",
    other: "📎",
  };

  // Count documents by category
  documents.forEach((doc) => {
    if (doc.category in categoryConfig) {
      categoryConfig[doc.category as keyof typeof categoryConfig].count++;
    }
  });

  const filteredDocuments =
    selectedCategory === "all"
      ? documents
      : documents.filter((doc) => doc.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link
        href="/portal/projects"
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Proyectos
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{projectName}</h1>
        <p className="mt-2 text-gray-600">
          Todos los documentos del proyecto en un solo lugar
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Folder className="w-5 h-5 text-gray-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
          <p className="text-sm text-gray-600">Total Documentos</p>
        </div>

        {Object.entries(categoryConfig).map(([key, config]) => (
          <div key={key} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{config.count}</p>
            <p className="text-sm text-gray-600">{config.label}</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Todos ({documents.length})
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {config.label} ({config.count})
            </button>
          ))}
        </div>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredDocuments.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* File Icon */}
                <div className="text-4xl flex-shrink-0">
                  {fileTypeIcons[doc.type]}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {doc.name}
                      </h3>
                      {doc.description && (
                        <p className="text-sm text-gray-600 mb-2">
                          {doc.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                        <span
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            categoryConfig[
                              doc.category as keyof typeof categoryConfig
                            ].color
                          }`}
                        >
                          {
                            categoryConfig[
                              doc.category as keyof typeof categoryConfig
                            ].label
                          }
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(doc.uploaded_at)}
                        </span>
                        <span>•</span>
                        <span>{doc.size}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="w-4 h-4" />
                    Ver
                  </button>
                  <a
                    href={doc.url}
                    download
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descargar
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay documentos en esta categoría
          </h3>
          <p className="text-gray-600">
            Selecciona otra categoría para ver más documentos
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          📋 Sobre tus documentos
        </h3>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Todos los documentos están disponibles para descarga en cualquier
              momento
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>
              Los resúmenes de reuniones se suben dentro de las 48 horas
              posteriores
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 font-bold">•</span>
            <span>Si necesitas algún documento adicional, contáctanos</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
