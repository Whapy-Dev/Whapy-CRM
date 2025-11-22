import { useState } from "react";
import { AlertCircle } from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Client, InsertData, Project } from "../page";

type AssignDocumentModalProps = {
  show: boolean;
  project: Project | null;
  client: Client | null;
  onClose: () => void;
  refetchProfile: () => void;
};

export default function AssignDocumentModal({
  show,
  project,
  client,
  onClose,
  refetchProfile,
}: AssignDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [categoryDocument, setCategoryDocument] = useState("");
  const [typeDocument, setTypeDocument] = useState("");
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [errorFormDocument, setErrorFormDocument] = useState("");
  const [successDocument, setSuccessDocument] = useState(false);

  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleNewDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !client) return;

    if (!title || !file || !categoryDocument || !typeDocument) {
      setErrorFormDocument("Completa todos los campos antes de guardar");
      setLoadingDocument(false);
      return;
    }

    setLoadingDocument(true);
    setErrorFormDocument("");
    setSuccessDocument(false);

    const fileExt = file.name.split(".").pop();
    const filePath = `${client.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("contracts")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      setErrorFormDocument("Error al subir el PDF");
      setLoadingDocument(false);
      return;
    }

    const fileStoragePath = uploadData?.path;

    const insertData: InsertData = {
      project_id: project.id,
      title,
      document_url: fileStoragePath,
      category_document: categoryDocument,
      type_document: typeDocument,
      user_id: client.id,
    };

    const { error } = await supabase.from("documents").insert(insertData);
    await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    await queryClient.invalidateQueries({ queryKey: ["leads"] });

    if (error) {
      console.error(error);
      setErrorFormDocument("Error al asignar documento");
    } else {
      setSuccessDocument(true);
      await refetchProfile();

      // Reset
      setTitle("");
      setFile(null);
      setCategoryDocument("");
      setTypeDocument("");

      setTimeout(() => {
        onClose();
        setSuccessDocument(false);
      }, 1000);
    }

    setLoadingDocument(false);
  };

  if (!show || !project) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <h3 className="text-xl font-bold mb-4">
          Asignar Documento a {project.title}
        </h3>
        {errorFormDocument && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errorFormDocument}</p>
          </div>
        )}

        {successDocument && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            Cambios guardados correctamente
          </div>
        )}

        <form onSubmit={handleNewDocument} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              id="title"
              name="title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="Ej: Documento principal"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Archivo PDF
            </label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría del Documento
            </label>
            <select
              value={categoryDocument}
              onChange={(e) => setCategoryDocument(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150 bg-white"
            >
              <option value="">Seleccionar...</option>
              <option value="Presupuestos">Presupuestos</option>
              <option value="Contratos">Contratos</option>
              <option value="Diseño">Diseño</option>
              <option value="Repositorio">Repositorio</option>
              <option value="Accesos">Accesos</option>
              <option value="Otros Recursos">Otros Recursos</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="typeDocument"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tipo de Documento
            </label>
            <input
              value={typeDocument}
              onChange={(e) => setTypeDocument(e.target.value)}
              type="text"
              id="typeDocument"
              name="typeDocument"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-150"
              placeholder="Ej: PDF, Imagen, Contrato..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-lg font-medium duration-150 hover:bg-gray-400 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loadingDocument}
              className={`w-full px-4 py-2 rounded-lg text-white font-medium transition-colors duration-150 ${
                loadingDocument
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              }`}
            >
              {loadingDocument ? "Actualizando..." : "Asignar Documento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
