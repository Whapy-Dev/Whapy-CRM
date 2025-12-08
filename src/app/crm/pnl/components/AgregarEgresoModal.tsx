// AgregarEgresoModal.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useEmplooyes } from "@/hooks/admin/useEmployees";
import { argentinaNow } from "./AgregarIngresoModal";
import { useAuth } from "@/hooks/useAuth";

type Egresos = {
  id: string;
  user_id?: string;
  profiles?: {
    nombre: string;
  };
  Egreso?: number;
  Descripcion?: string;
  categoria: string;
  subcategoria: string;
  created_at: string;
  recurrente: string;
  divisa: string;
  es_recurrente?: boolean;
  fecha_recurrente?: string;
  intervalo?: string;
  factura_url?: string;
};

type Props = {
  onClose: () => void;
  refetchEgresos: () => void;
  egresoToEdit?: Egresos | null;
};

const categoriasMap: Record<string, string[]> = {
  "Sueldos y honorarios": [
    "Programadores",
    "Diseñadores",
    "QA/Testers",
    "Project Managers",
    "Ventas / Closers",
    "Administración / Soporte",
    "Freelancers externos",
  ],
  "Infraestructura y herramientas": [
    "Servidores y hosting",
    "Dominios",
    "GitHub / GitLab",
    "Figma",
    "Notion",
    "Licencias de software",
  ],
  "Marketing y ventas": [
    "Publicidad",
    "CRM",
    "Contenido y diseño",
    "Comisiones de ventas",
    "Producción audiovisual",
  ],
  "Operaciones y administración": [
    "Contador",
    "Honorarios legales",
    "Gestión impositiva",
    "Tasa municipal / impuestos varios",
    "Costos de facturación y cobros",
  ],
  "Equipamiento y tecnología": [
    "Laptops",
    "Monitores",
    "Accesorios",
    "Reparaciones o reemplazos",
    "Periféricos adicionales",
  ],
  "Oficina y servicios": [
    "Alquiler",
    "Internet",
    "Luz",
    "Agua",
    "Mobiliario",
    "Limpieza",
  ],
  Capacitación: ["Cursos", "Certificaciones", "Entrenamientos internos"],
  "Viajes y reuniones": [
    "Combustible",
    "Pasajes",
    "Hoteles",
    "Comidas con clientes",
    "Eventos / ferias",
  ],
};

export function ModalAgregarEgreso({
  onClose,
  refetchEgresos,
  egresoToEdit,
}: Props) {
  const { user } = useAuth();
  const { data: dataProfiles = [], isLoading } = useEmplooyes();

  const isEditing = Boolean(egresoToEdit);
  const [fechaIngreso, setFechaIngreso] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [categoria, setCategoria] = useState("");
  const [subCategoria, setSubCategoria] = useState("");
  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [userId, setUserId] = useState("");
  const [userNombre, setUserNombre] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [open, setOpen] = useState(false);

  // Estados para recurrencia
  const [esRecurrente, setEsRecurrente] = useState(false);
  const [fechaRecurrente, setFechaRecurrente] = useState("");
  const [intervalo, setIntervalo] = useState("1 month");

  // Estados para factura
  const [facturaFile, setFacturaFile] = useState<File | null>(null);
  const [facturaUrl, setFacturaUrl] = useState<string | null>(null);
  const [uploadingFactura, setUploadingFactura] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-cargar datos cuando se está editando
  useEffect(() => {
    if (egresoToEdit) {
      setCategoria(egresoToEdit.categoria || "");
      setSubCategoria(egresoToEdit.subcategoria || "");
      setMonto(egresoToEdit.Egreso || 0);
      setDescripcion(egresoToEdit.Descripcion || "");
      setFechaIngreso(
        egresoToEdit.created_at
          ? new Date(egresoToEdit.created_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );
      if (egresoToEdit.user_id) {
        setUserId(egresoToEdit.user_id);
      }
      if (egresoToEdit.profiles?.nombre) {
        setUserNombre(egresoToEdit.profiles.nombre);
      }
      setEsRecurrente(egresoToEdit.es_recurrente || false);
      setFechaRecurrente(egresoToEdit.fecha_recurrente || "");
      setIntervalo(egresoToEdit.intervalo || "1 month");
      setFacturaUrl(egresoToEdit.factura_url || null);
    }
  }, [egresoToEdit]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (isLoading)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200">
          <div>Cargando...</div>
        </div>
      </div>
    );

  const filtrados = dataProfiles.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Función para subir factura
  async function uploadFactura(file: File): Promise<string | null> {
    const supabase = createClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `egresos/${fileName}`;

    const { error } = await supabase.storage
      .from("facturas")
      .upload(filePath, file);

    if (error) {
      console.error("Error al subir factura:", error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("facturas")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  }

  // Manejar selección de archivo
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Solo se permiten archivos PDF, PNG, JPG o WEBP");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert("El archivo no puede superar los 10MB");
        return;
      }
      setFacturaFile(file);
    }
  }

  // Eliminar factura seleccionada
  function removeFactura() {
    setFacturaFile(null);
    setFacturaUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit() {
    const supabase = createClient();
    if (!categoria || !subCategoria || monto <= 0) return;

    if (esRecurrente && !fechaRecurrente) {
      console.warn("Falta fecha de recurrencia");
      return;
    }

    try {
      setUploadingFactura(true);

      // Subir factura si hay una nueva
      let finalFacturaUrl = facturaUrl;
      if (facturaFile) {
        finalFacturaUrl = await uploadFactura(facturaFile);
      }

      if (isEditing && egresoToEdit) {
        // MODO EDICIÓN
        const { error } = await supabase
          .from("Egresos")
          .update({
            user_id: userId || null,
            categoria: categoria,
            subcategoria: subCategoria,
            Egreso: monto,
            Descripcion: descripcion,
            es_recurrente: esRecurrente,
            fecha_recurrente: esRecurrente ? fechaRecurrente : null,
            intervalo: esRecurrente ? intervalo : null,
            factura_url: finalFacturaUrl,
            created_at: new Date(fechaIngreso + "T12:00:00").toISOString(),
          })
          .eq("id", egresoToEdit.id);

        if (error) throw error;

        const { error: errorHistory } = await supabase
          .from("historial_actividad")
          .insert([
            {
              usuario_modificador_id: user?.id,
              accion: "Editó un egreso",
              usuario_modificado: userNombre || "Sin usuario",
              seccion: "PNL",
            },
          ]);

        if (errorHistory) throw errorHistory;
      } else {
        // MODO AGREGAR
        const { error } = await supabase.from("Egresos").insert({
          user_id: userId || null,
          categoria: categoria,
          subcategoria: subCategoria,
          Egreso: monto,
          Descripcion: descripcion,
          created_at: new Date(fechaIngreso + "T12:00:00").toISOString(),
          es_recurrente: esRecurrente,
          fecha_recurrente: esRecurrente ? fechaRecurrente : null,
          intervalo: esRecurrente ? intervalo : null,
          factura_url: finalFacturaUrl,
        });

        if (error) throw error;

        const { error: errorHistory } = await supabase
          .from("historial_actividad")
          .insert([
            {
              usuario_modificador_id: user?.id,
              accion: "Añadió un egreso",
              usuario_modificado: userNombre,
              seccion: "PNL",
            },
          ]);

        if (errorHistory) throw errorHistory;
      }

      setMonto(0);
      setDescripcion("");
      setUserId("");
      setUserNombre("");
      setBusqueda("");
      setEsRecurrente(false);
      setFechaRecurrente("");
      setIntervalo("1 month");
      setFacturaFile(null);
      setFacturaUrl(null);
      await refetchEgresos();
      onClose();
    } catch (error) {
      console.error("Error al guardar egreso:", error);
    } finally {
      setUploadingFactura(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Editar Egreso" : "Agregar Egreso"}
        </h2>

        {/* SELECT USUARIO */}
        <div className="relative w-full mb-3">
          <button
            ref={btnRef}
            onClick={() => setOpen(!open)}
            className="w-full border border-gray-300 rounded-lg p-2 text-left bg-white flex justify-between items-center"
          >
            <span className={userNombre ? "text-gray-900" : "text-gray-500"}>
              {userNombre || "Seleccionar usuario"}
            </span>
            <span className="text-gray-400 text-sm">▼</span>
          </button>

          {open && (
            <div
              ref={ref}
              className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-2"
            >
              <input
                autoFocus
                type="text"
                placeholder="Buscar usuario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 mb-2"
              />

              <div className="max-h-48 overflow-y-auto space-y-1">
                {filtrados.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setUserNombre(p.nombre);
                      setUserId(p.id);
                      setOpen(false);
                      setBusqueda("");
                    }}
                    className={`w-full text-left px-3 py-1 hover:bg-gray-100 rounded-lg ${
                      userId === p.id
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : ""
                    }`}
                  >
                    {p.nombre}
                  </button>
                ))}

                {filtrados.length === 0 && (
                  <div className="px-3 py-1 text-gray-500 text-sm">
                    No se encontraron usuarios
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SELECT CATEGORÍA */}
        <div className="space-y-3">
          <div>
            <label className="font-medium">Categoría</label>
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value);
                setSubCategoria("");
              }}
              className="w-full border p-2 rounded-xl mt-1 cursor-pointer"
            >
              <option value="" disabled>
                Seleccionar categoría
              </option>
              {Object.keys(categoriasMap).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* SELECT SUBCATEGORÍA */}
          {categoria && (
            <div>
              <label className="font-medium">Subcategoría</label>
              <select
                value={subCategoria}
                onChange={(e) => setSubCategoria(e.target.value)}
                className="w-full border p-2 rounded-xl mt-1 cursor-pointer"
              >
                <option value="" disabled>
                  Seleccionar subcategoría
                </option>
                {categoriasMap[categoria].map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* INPUT DESCRIPCIÓN */}
          <div>
            <label className="font-medium text-gray-700">Descripción</label>
            <input
              type="text"
              placeholder="Ej: Pago del hosting mensual"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
            />
          </div>

          {/* INPUT MONTO */}
          <div>
            <label className="font-medium text-gray-700">Monto</label>
            <input
              type="number"
              placeholder="Ej: 150000"
              value={monto || ""}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
            />
          </div>

          {/* UPLOAD FACTURA */}
          <div>
            <label className="text-sm text-gray-600">
              Factura (PDF, PNG, JPG, WEBP - máx 5MB)
            </label>

            {facturaUrl || facturaFile ? (
              <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-blue-600"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">
                    {facturaFile?.name || "Factura adjunta"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {facturaUrl && !facturaFile && (
                    <a
                      href={facturaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Ver factura"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={removeFactura}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar factura"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition text-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mx-auto text-gray-400 mb-2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                <p className="text-sm text-gray-500">
                  Click para subir factura
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha del ingreso
            </label>
            <input
              type="date"
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2.5 mt-1"
            />
          </div>
          {/* CHECKBOX RECURRENTE */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="esRecurrente"
              checked={esRecurrente}
              onChange={(e) => setEsRecurrente(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            <label
              htmlFor="esRecurrente"
              className="text-sm text-gray-700 cursor-pointer"
            >
              Es recurrente (se repite automáticamente)
            </label>
          </div>

          {/* CAMPOS DE RECURRENCIA */}
          {esRecurrente && (
            <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Próxima fecha de cobro
                </label>
                <input
                  type="date"
                  value={fechaRecurrente}
                  onChange={(e) => setFechaRecurrente(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Repetir cada
                </label>
                <select
                  value={intervalo}
                  onChange={(e) => setIntervalo(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mt-1 cursor-pointer"
                >
                  <option value="1 week">1 semana</option>
                  <option value="2 weeks">2 semanas</option>
                  <option value="1 month">1 mes</option>
                  <option value="2 months">2 meses</option>
                  <option value="3 months">3 meses</option>
                  <option value="6 months">6 meses</option>
                  <option value="1 year">1 año</option>
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              uploadingFactura ||
              !categoria ||
              !subCategoria ||
              monto <= 0 ||
              (esRecurrente && !fechaRecurrente)
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400 cursor-pointer"
          >
            {uploadingFactura
              ? "Subiendo..."
              : isEditing
              ? "Guardar"
              : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
