"use client";

import { useState } from "react";
import { Client, Document, Project } from "../page";
import { createClient } from "@/lib/supabase/client";
import { AlertCircle, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

type ClientDocumentsModalProps = {
  show: boolean;
  project: Project | null;
  client: Client;
  onClose: () => void;
  refetchProfile: () => void;
};

const supabase = createClient();

export default function ShowDocumentsClientModal({
  show,
  project,
  client,
  onClose,
  refetchProfile,
}: ClientDocumentsModalProps) {
  const { user } = useAuth();
  const [searchTitle, setSearchTitle] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [error, setError] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  if (!show || !project) return null;

  const documents = project.documents || [];

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(searchTitle.toLowerCase())
  );

  const eliminarDocumento = async (documento: Document) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documento.id);

      if (error) {
        console.error("Error en Supabase:", error);
        setError("Error eliminando el documento.");
      } else {
        const { error } = await supabase.from("historial_actividad").insert([
          {
            usuario_modificador_id: user?.id,
            accion: "Eliminó un documento",
            usuario_modificado: client?.nombre,
            seccion: "Usuarios",
          },
        ]);

        if (error) throw error;
        await refetchProfile();
        setSelectedDocument(null);
      }
    } catch (err) {
      console.error("Error eliminando documento:", err);
      setError("Error inesperado al eliminar el documento.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-3xl p-6 w-full max-w-6xl min-h-[40rem] shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Documentos</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Filtro */}
        <div className="flex justify-center mb-6">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={searchTitle}
            onChange={(e) => setSearchTitle(e.target.value)}
            className="border rounded-lg p-2 w-full max-w-sm"
          />
        </div>

        {/* Lista de documentos */}
        {filteredDocs.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                onClick={() => setSelectedDocument(doc)}
              >
                <h4 className="font-semibold text-gray-800 mb-1">
                  {doc.title}
                </h4>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Categoría:</strong> {doc.category_document}
                </p>
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center mt-6">
            No se encontraron documentos
          </p>
        )}
      </div>

      {/* Modal del documento seleccionado */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[800px] shadow-2xl border border-gray-200 flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold">{selectedDocument.title}</h3>
              <button
                onClick={() => setSelectedDocument(null)}
                className="px-4 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 font-medium cursor-pointer"
              >
                Cerrar
              </button>
            </div>

            <p>
              <strong>Categoría:</strong>{" "}
              {selectedDocument.category_document || "Sin categoría"}
            </p>
            <p>
              <strong>Fecha:</strong>{" "}
              {new Date(selectedDocument.created_at).toLocaleString()}
            </p>

            <button
              onClick={() => {
                const url = supabase.storage
                  .from("contracts")
                  .getPublicUrl(selectedDocument.document_url).data.publicUrl;

                setPdfUrl(url);
              }}
              className="text-blue-600  cursor-pointer"
            >
              Abrir documento
            </button>

            <button
              onClick={() => eliminarDocumento(selectedDocument)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 cursor-pointer"
            >
              Eliminar documento
            </button>
          </div>
        </div>
      )}

      {/* Vista previa del PDF */}
      {pdfUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg relative w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-semibold text-lg">
                Vista previa del documento
              </h3>
              <button
                className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
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
    </div>
  );
}
