import { useState } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

type CreateAccountModalProps = {
  show: boolean;
  onClose: () => void;
  refetchProfiles: () => void;
};

export default function CreateAccountModal({
  show,
  onClose,
  refetchProfiles,
}: CreateAccountModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorForm, setErrorForm] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [paisInput, setPaisInput] = useState("Argentina");
  const [fechaInput, setFechaInput] = useState("");
  const [generoInput, setGeneroInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [telefonoInput, setTelefonoInput] = useState("");
  const [empresaInput, setEmpresaInput] = useState("");
  const [ciudadInput, setCiudadInput] = useState("");
  const [codigoPostal, setCodigoPostal] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [detalleInput, setDetalleInput] = useState("");

  const handleCreateAccount = async (e: React.FormEvent) => {
    const supabase = createClient();
    e.preventDefault();
    setLoading(true);
    setErrorForm("");
    setSuccessMessage("");

    try {
      const res = await fetch("/api/create-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
          genero: generoInput,
          fechaNacimiento: fechaInput,
          nombre: nameInput,
          telefono: telefonoInput,
          empresa: empresaInput,
          ciudad: ciudadInput,
          codigoPostal: codigoPostal,
          pais: paisInput,
          type: typeInput,
          detalle: detalleInput,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error desconocido");

      const { error } = await supabase.from("historial_actividad").insert([
        {
          usuario_modificador_id: user?.id,
          accion: "Creó una cuenta de usuario",
          usuario_modificado: nameInput,
          seccion: "Usuarios",
        },
      ]);

      if (error) throw error;

      setSuccessMessage(`Usuario creado: ${data.user.email}`);
      setEmailInput("");
      setPasswordInput("");
      setNameInput("");
      setGeneroInput("");
      setFechaInput("");
      setTelefonoInput("");
      setEmpresaInput("");
      setCiudadInput("");
      setCodigoPostal("");
      setPaisInput("");
      setTypeInput("");
      setDetalleInput("");

      // ✅ Usar refetchProfiles
      await refetchProfiles();

      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err: unknown) {
      console.log(err);

      if (err instanceof Error) {
        setErrorForm(err.message);
      } else {
        setErrorForm("Ocurrió un error desconocido");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Crear cuenta de usuario</h2>

        <form onSubmit={handleCreateAccount} className="space-y-4">
          {errorForm && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errorForm}</p>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800 whitespace-pre-line">
                {successMessage}
              </p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cliente
            </label>
            <select
              name=""
              id=""
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
            >
              <option value="">Seleccione un tipo de cliente</option>
              <option value="Cliente">Cliente</option>
              <option value="Lead">Lead</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre
            </label>
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="Juan Pérez"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha de nacimiento
            </label>
            <input
              type="datetime"
              value={fechaInput}
              onChange={(e) => setFechaInput(e.target.value)}
              placeholder="20/11/1990"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genero
            </label>
            <select
              name=""
              id=""
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={generoInput}
              onChange={(e) => setGeneroInput(e.target.value)}
            >
              <option value="">Seleccione un genero</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pais
            </label>
            <input
              type="datetime"
              value={paisInput}
              onChange={(e) => setPaisInput(e.target.value)}
              placeholder="Ej: España"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefono
            </label>
            <input
              type="text"
              value={telefonoInput}
              onChange={(e) => setTelefonoInput(e.target.value)}
              placeholder="+54 9 11 23211123"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empresa
            </label>
            <input
              type="text"
              value={empresaInput}
              onChange={(e) => setEmpresaInput(e.target.value)}
              placeholder="SolutionsTeam"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              value={ciudadInput}
              onChange={(e) => setCiudadInput(e.target.value)}
              placeholder="Jose C. Páz"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Codigo Postal
            </label>
            <input
              type="text"
              value={codigoPostal}
              onChange={(e) => setCodigoPostal(e.target.value)}
              placeholder="3107"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Detalle
            </label>
            <textarea
              value={detalleInput}
              onChange={(e) => setDetalleInput(e.target.value)}
              placeholder="Escribe detalles adicionales sobre el cliente..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="cliente@ejemplo.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={loading}
              minLength={6}
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta contraseña es temporal. El cliente debería cambiarla después
              del primer login.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 ${
                loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
              }`}
            >
              {loading ? "Creando..." : "Crear Cuenta"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
