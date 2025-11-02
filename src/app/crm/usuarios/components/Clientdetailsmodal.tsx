import { Client, Project } from "../page";
import ProjectCard from "./Projectcard";

type ClientDetailsModalProps = {
  show: boolean;
  client: Client | null;
  onClose: () => void;
  onEditProject: (project: Project) => void;
  onAssignDocument: (project: Project) => void;
  onAssignMeeting: (project: Project) => void;
};

export default function ClientDetailsModal({
  show,
  client,
  onClose,
  onEditProject,
  onAssignDocument,
  onAssignMeeting,
}: ClientDetailsModalProps) {
  if (!show || !client) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 w-full overflow-y-auto max-h-[90vh] shadow-2xl border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          {client?.nombre || "—"}
        </h2>

        {/* Card Datos Personales */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl shadow-md border border-blue-200">
          <h3 className="text-xl font-semibold mb-4 text-blue-700">
            Datos Personales
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-800">
            <p>
              <strong>Email:</strong> {client.email}
            </p>
            <p>
              <strong>Teléfono:</strong> {client?.telefono || "—"}
            </p>
            <p>
              <strong>Empresa:</strong> {client.empresa || "—"}
            </p>
            <p>
              <strong>Ciudad:</strong> {client.ciudad || "—"}
            </p>
            <p>
              <strong>Código Postal:</strong> {client.codigoPostal || "—"}
            </p>
            <p>
              <strong>Tipo:</strong> {client.type || "—"}
            </p>
            <p>
              <strong>Genero:</strong> {client.genero || "—"}
            </p>
            <p>
              <strong>Fecha de Nacimiento:</strong>{" "}
              {client.fechaNacimiento || "—"}
            </p>
            <p>
              <strong>Pais:</strong> {client.pais || "—"}
            </p>
            <p className="text-pretty">
              <strong>Detalles:</strong> {client.detalles || "—"}
            </p>
          </div>
        </div>

        {/* Proyectos */}
        <h3 className="text-2xl font-semibold mb-4 text-gray-900">Proyectos</h3>
        {client.projects?.length ? (
          <div className="grid grid-cols-2 gap-5">
            {client.projects.map((project: Project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onEditClick={() => onEditProject(project)}
                onAssignDocument={() => onAssignDocument(project)}
                onAssignMeeting={() => onAssignMeeting(project)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No tiene proyectos</p>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-300 rounded-2xl hover:bg-gray-400 font-medium cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
