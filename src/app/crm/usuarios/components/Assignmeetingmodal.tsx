import { useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Client, InsertMeetingData, Project } from "../page";

type AssignMeetingModalProps = {
  show: boolean;
  project: Project | null;
  client: Client | null;
  onClose: () => void;
  refetchProfiles: () => void;
};

export default function AssignMeetingModal({
  show,
  project,
  client,
  onClose,
  refetchProfiles,
}: AssignMeetingModalProps) {
  const [titleMeeting, setTitleMeeting] = useState("");
  const [startAtMeeting, setStartAtMeeting] = useState("");
  const [location, setLocation] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [summaryMd, setSummaryMd] = useState("");
  const [summaryPdfUrl, setSummaryPdfUrl] = useState("");
  const [typeMeeting, setTypeMeeting] = useState("");
  const [estado, setEstado] = useState("");
  const [duration, setDuration] = useState("");
  const [errorFormMeeting, setErrorFormMeeting] = useState("");
  const [successMeeting, setSuccessMeeting] = useState(false);

  const queryClient = useQueryClient();
  const supabase = createClient();

  const handleNewMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !client) return;

    if (
      !titleMeeting ||
      !location ||
      !meetUrl ||
      !summaryPdfUrl ||
      !typeMeeting ||
      !estado ||
      !duration
    ) {
      setErrorFormMeeting("Completa todos los campos antes de guardar");
      return;
    }

    setErrorFormMeeting("");
    setSuccessMeeting(false);

    const insertData: InsertMeetingData = {
      project_id: project.id,
      title: titleMeeting,
      start_at: startAtMeeting,
      location: location,
      meet_url: meetUrl,
      summary_md: summaryMd,
      summary_pdf_url: summaryPdfUrl,
      type_meeting: typeMeeting,
      estado: estado,
      duration: duration,
    };

    if (client.type === "Lead") {
      insertData.lead_id = client.id;
    } else {
      insertData.user_id = client.id;
    }

    const { error } = await supabase.from("all_meetings").insert(insertData);
    await queryClient.invalidateQueries({ queryKey: ["profiles"] });
    await queryClient.invalidateQueries({ queryKey: ["leads"] });
    if (error) {
      console.error(error);
      setErrorFormMeeting("Error al asignar reunión");
    } else {
      setSuccessMeeting(true);
      await refetchProfiles();

      setTitleMeeting("");
      setStartAtMeeting("");
      setLocation("");
      setMeetUrl("");
      setSummaryMd("");
      setSummaryPdfUrl("");
      setTypeMeeting("");
      setEstado("");
      setDuration("");
      setTimeout(() => {
        onClose();
        setSuccessMeeting(false);
      }, 1000);
    }
  };

  if (!show || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-200">
        <h3 className="text-xl font-bold mb-4">
          Asignar Reunión a {project.title}
        </h3>
        {successMeeting && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            Cambios guardados correctamente
          </div>
        )}
        {errorFormMeeting && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {errorFormMeeting}
          </div>
        )}
        <form className="space-y-4" onSubmit={handleNewMeeting}>
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              value={titleMeeting}
              onChange={(e) => setTitleMeeting(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Fecha/Hora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha y hora
            </label>
            <input
              type="datetime-local"
              value={startAtMeeting}
              onChange={(e) => setStartAtMeeting(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ubicación
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Seleccionar ubicacion</option>
              <option value="meet">meet</option>
              <option value="zoom">zoom</option>
              <option value="telefono">telefono</option>
              <option value="presencial">presencial</option>
            </select>
          </div>

          {/* URL de la reunión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL de la reunión
            </label>
            <input
              type="text"
              value={meetUrl}
              onChange={(e) => setMeetUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Resumen en Markdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Resumen (Markdown)
            </label>
            <textarea
              value={summaryMd}
              onChange={(e) => setSummaryMd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Opcional"
            />
          </div>

          {/* URL PDF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL del resumen en PDF
            </label>
            <input
              type="text"
              value={summaryPdfUrl}
              onChange={(e) => setSummaryPdfUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Tipo de reunión */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de reunión
            </label>
            <select
              value={typeMeeting}
              onChange={(e) => setTypeMeeting(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Seleccionar tipo de reunion</option>
              <option value="Lead">lead</option>
              <option value="proyecto">proyecto</option>
              <option value="seguimiento">seguimiento</option>
            </select>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
              required
            >
              <option value="">Seleccionar...</option>
              <option value="programada">Programada</option>
              <option value="completada">Completada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>

          {/* Duración */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duración (minutos)
            </label>
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-2xl hover:bg-gray-400 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 cursor-pointer"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
