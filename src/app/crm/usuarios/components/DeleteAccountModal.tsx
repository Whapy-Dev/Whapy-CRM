import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { Client } from "../page";
import { useRouter } from "next/navigation";

type DeleteAccountModalProps = {
  show: boolean;
  client: Client | null;
  onClose: () => void;
  refetchProfile: () => void;
};

export default function DeleteAccountModal({
  show,
  client,
  onClose,
  refetchProfile,
}: DeleteAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();
  const handleDelete = async () => {
    if (!client) return;

    setLoading(true);
    setErrorForm("");
    setSuccessMessage("");

    try {
      const res = await fetch(`/api/delete-client`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: client.id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar usuario");

      setSuccessMessage(`La cuenta de ${client.nombre} fue eliminada`);

      await refetchProfile();

      setTimeout(() => {
        router.push("/crm/usuariosprueba");
      }, 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorForm(err.message);
        console.log(err);
      } else {
        setErrorForm("Error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!show || !client) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-200">
        <h2 className="text-xl font-bold mb-4 text-red-600">Eliminar cuenta</h2>

        <p className="text-gray-700 mb-4">
          ¿Seguro que deseas eliminar la cuenta de{" "}
          <strong>{client.nombre}</strong>? Esta acción no se puede deshacer.
        </p>

        {errorForm && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg mb-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{errorForm}</p>
          </div>
        )}

        {successMessage && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
            disabled={loading}
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className={`flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}
