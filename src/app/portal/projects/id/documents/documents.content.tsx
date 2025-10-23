"use client";

import { useState } from "react";
import { FileText, Download, Eye, Calendar } from "lucide-react";

type Document = {
  id: string;
  title: string;
  type: string;
  size: string;
  upload_date: string;
  category: string;
  url: string;
};

type Props = {
  documents: Document[];
  projectId: string;
};

export default function DocumentsContent({ documents, projectId }: Props) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Contractual: "bg-red-100 text-red-800",
      Técnico: "bg-blue-100 text-blue-800",
      Reuniones: "bg-purple-100 text-purple-800",
      Diseño: "bg-green-100 text-green-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type: string) => {
    if (type === "PDF") {
      return <FileText className="w-8 h-8 text-red-600" />;
    }
    if (type === "Figma") {
      return (
        <svg
          className="w-8 h-8 text-purple-600"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M8 2C6.895 2 6 2.895 6 4v16c0 1.105.895 2 2 2s2-.895 2-2V4c0-1.105-.895-2-2-2zm8 0c-1.105 0-2 .895-2 2v8c0 1.105.895 2 2 2s2-.895 2-2V4c0-1.105-.895-2-2-2zm0 12c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2zM8 10c-1.105 0-2 .895-2 2s.895 2 2 2 2-.895 2-2-.895-2-2-2z" />
        </svg>
      );
    }
    return <FileText className="w-8 h-8 text-gray-600" />;
  };

  const categories = ["Todos", "Contractual", "Técnico", "Reuniones", "Diseño"];
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredDocs =
    selectedCategory === "Todos"
      ? documents
      : documents.filter((doc) => doc.category === selectedCategory);

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
          <p className="text-sm text-gray-600">Total Documentos</p>
        </div>

        {["Contractual", "Técnico", "Reuniones"].map((cat) => (
          <div key={cat} className="bg-white rounded-lg shadow p-6">
            <p className="text-2xl font-bold text-gray-900">
              {documents.filter((d) => d.category === cat).length}
            </p>
            <p className="text-sm text-gray-600">{cat}</p>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              {getTypeIcon(doc.type)}
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(
                  doc.category
                )}`}
              >
                {doc.category}
              </span>
            </div>

            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
              {doc.title}
            </h3>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(doc.upload_date)}
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {doc.type} • {doc.size}
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Ver
              </a>
              <a
                href={doc.url}
                download
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {filteredDocs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay documentos en esta categoría
          </h3>
          <p className="text-gray-600">Prueba seleccionando otra categoría</p>
        </div>
      )}
    </>
  );
}
