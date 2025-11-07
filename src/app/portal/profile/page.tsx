"use client";

import { useState, useEffect } from "react";
import { User, Mail, Phone, Camera, Save, X, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const supabase = createClient();
  const [isEditing, setIsEditing] = useState(false);
  const [isRealEmail, setIsRealEmail] = useState("");
  const [profile, setProfile] = useState({
    id: "",
    nombre: "",
    email: "",
    telefono: "",
    ciudad: "",
    codigoPostal: "",
    pais: "",
    genero: "",
    fechaNacimiento: "",
  });
  const [editForm, setEditForm] = useState({ ...profile });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChangePassword, setShowChangePassword] = useState(false);

  useEffect(() => {
    const getUserProfile = async () => {
      setLoading(true);
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (!userData || userError) {
        console.error("No hay usuario logueado o hubo error:", userError);
        setLoading(false);
        return;
      }

      const userId = userData.user?.id;
      if (!userId) {
        console.error("No se pudo obtener ID del usuario");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error al cargar perfil:", error.message);
        setLoading(false);
        return;
      }

      const safeData = {
        id: data.id || "",
        nombre: data.nombre || "",
        email: data.email || "",
        telefono: data.telefono || "",
        ciudad: data.ciudad || "",
        codigoPostal: data.codigoPostal || "",
        pais: data.pais || "",
        genero: data.genero || "",
        fechaNacimiento: data.fechaNacimiento || "",
      };

      setProfile(safeData);
      setEditForm(safeData);
      setIsRealEmail(userData.user.email ?? "");
      setLoading(false);
    };

    getUserProfile();
  }, []);
  if (loading) {
    return <div>Cargando perfil...</div>;
  }
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { data: updatedProfile, error: profileError } = await supabase
        .from("profiles")
        .update({
          nombre: editForm.nombre,
          telefono: editForm.telefono,
          ciudad: editForm.ciudad,
          codigoPostal: editForm.codigoPostal,
          genero: editForm.genero,
          fechaNacimiento: editForm.fechaNacimiento,
          pais: editForm.pais,
        })
        .eq("id", profile.id)
        .select()
        .single();

      if (profileError) throw profileError;

      setProfile(updatedProfile);
      setIsEditing(false);
      setIsSaving(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error actualizando perfil:", err.message);
      } else {
        console.error("Error actualizando perfil:", err);
      }

      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Mi Perfil</h1>
        <p className="mt-2 text-gray-600">
          Gestiona tu información personal y preferencias
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-lg"></div>

        <div className="px-8 pb-8">
          {/* Avatar Section */}
          <div className="relative -mt-16 mb-6">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                {/* {(isEditing ? editForm.avatar : profile.avatar) && (
                  <Image
                    // src={isEditing ? editForm.avatar! : profile.avatar!}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                )} */}
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-16 h-16 text-gray-400" />
                </div>
              </div>
              {isEditing && (
                <label className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera className="w-5 h-5 text-white" />
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mb-6">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Editar Perfil
              </button>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </button>
              </>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Personal Info Section */}
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>

                  <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                    {profile.email}
                  </p>
                </div>
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Nombre Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.nombre}
                      onChange={(e) =>
                        setEditForm({ ...editForm, nombre: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profile.nombre}
                    </p>
                  )}
                </div>
                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Teléfono
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.telefono}
                      onChange={(e) =>
                        setEditForm({ ...editForm, telefono: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profile.telefono}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Ciudad
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.ciudad}
                      onChange={(e) =>
                        setEditForm({ ...editForm, ciudad: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profile.ciudad}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Codigo Postal
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.codigoPostal}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          codigoPostal: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profile.codigoPostal}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Genero
                  </label>
                  {isEditing ? (
                    <select
                      value={editForm.genero}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          genero: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccione un genero</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profile.genero}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Fecha de nacimiento
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.fechaNacimiento}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          fechaNacimiento: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profile.fechaNacimiento}
                    </p>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4" />
                    Pais
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.pais}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          pais: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                      {profile.pais}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Seguridad</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Contraseña</h3>
            </div>
            <button
              type="button"
              onClick={() => setShowChangePassword(!showChangePassword)}
              className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium cursor-pointer"
            >
              Cambiar
            </button>
          </div>
          {showChangePassword && <ChangePassword />}
        </div>
      </div>
    </div>
  );
}

function ChangePassword() {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChangePassword = async () => {
    setMessage("");
    setSuccess(false);

    if (!newPassword || !confirmPassword) {
      setMessage("⚠️ Completa ambos campos");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("❌ Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("⚠️ No hay usuario logueado");
      setLoading(false);
      return;
    }
    const { data: session } = await supabase.auth.getSession();
    if (!session.session) {
      setMessage("Tu sesión expiró. Volvé a iniciar sesión.");
      setLoading(false);
      return;
    }
    console.log("Intentando actualizar contraseña...");
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    console.log("Respuesta de updateUser:", { data, error });

    console.log("updateUser response:", { data, error });

    if (error) {
      setMessage(`❌ Error: ${error.message}`);
      setSuccess(false);
      return;
    } else {
      setMessage("✅ Contraseña actualizada correctamente");
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      console.log("Respuesta de updateUser:", { data, error });

      console.log("updateUser response:", { data, error });
    }
    console.log("Respuesta de updateUser:", { data, error });

    console.log("updateUser response:", { data, error });
    setLoading(false);
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
      {/* Nueva contraseña */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Nueva contraseña"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Confirmar contraseña */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Confirmar contraseña"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>

      <button
        type="button"
        onClick={handleChangePassword}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50"
      >
        {loading ? "Actualizando..." : "Cambiar"}
      </button>

      {message && (
        <p className={`text-sm ${success ? "text-green-600" : "text-red-600"}`}>
          {message}
        </p>
      )}
    </div>
  );
}
