// AgregarIngresoModal.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClientProject } from "@/hooks/admin/useClients";
import { useAuth } from "@/hooks/useAuth";

type Ingresos = {
  id: string;
  nombre: string;
  presupuesto_id: string;
  Ingreso?: number;
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
  refetchIngresos: () => Promise<void> | void;
  ingresoToEdit?: Ingresos | null;
};

export const argentinaNow = new Date().toLocaleString("en-US", {
  timeZone: "America/Argentina/Buenos_Aires",
});

export type Fase = {
  id: string;
  nombre: string;
  monto: number;
  estado: string;
  presupuesto_id: string;
};

export type Cuota = {
  id: string;
  cuota: number;
  detalle: string;
  monto: number;
  presupuesto_id: string;
  fase_id: string;
  vencimiento: string;
  estado: string;
};

export function ModalAgregarIngreso({
  onClose,
  refetchIngresos,
  ingresoToEdit,
}: Props) {
  const { user } = useAuth();
  const { data: dataClientProject = [], isLoading } = useClientProject();

  const isEditing = Boolean(ingresoToEdit);

  // Estado para categoría
  const [categoria, setCategoria] = useState<"Servicios" | "Proyectos">(
    "Proyectos"
  );

  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [project, setProject] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [presupuestoId, setPresupuestoId] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState(
    new Date().toISOString().split("T")[0]
  );
  // Estados para fases y cuotas
  const [fases, setFases] = useState<Fase[]>([]);
  const [faseSeleccionada, setFaseSeleccionada] = useState("");
  const [cuotasPendientes, setCuotasPendientes] = useState<Cuota[]>([]);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState("");

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

  // Loading states
  const [loadingFases, setLoadingFases] = useState(false);
  const [loadingCuotas, setLoadingCuotas] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtrar proyectos que tienen presupuesto
  const proyectosConPresupuesto = dataClientProject.filter(
    (p) => p.presupuesto && p.presupuesto.id
  );

  // Pre-cargar datos cuando se está editando
  useEffect(() => {
    if (ingresoToEdit) {
      setMonto(ingresoToEdit.Ingreso || 0);
      setDescripcion(ingresoToEdit.Descripcion || "");
      setFechaIngreso(
        ingresoToEdit.created_at
          ? new Date(ingresoToEdit.created_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0]
      );

      if (ingresoToEdit.nombre?.startsWith("Proyecto: ")) {
        setProjectTitle(ingresoToEdit.nombre.replace("Proyecto: ", ""));
        setCategoria("Proyectos");
      } else {
        setCategoria("Servicios");
      }
      setEsRecurrente(ingresoToEdit.es_recurrente || false);
      setFechaRecurrente(ingresoToEdit.fecha_recurrente || "");
      setIntervalo(ingresoToEdit.intervalo || "1 month");
      setFacturaUrl(ingresoToEdit.factura_url || null);
    }
  }, [ingresoToEdit]);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset cuando cambia la categoría
  useEffect(() => {
    if (categoria === "Servicios") {
      setProject("");
      setProjectTitle("");
      setPresupuestoId("");
      setFases([]);
      setFaseSeleccionada("");
      setCuotasPendientes([]);
      setCuotaSeleccionada("");
    }
  }, [categoria]);

  // Cargar fases cuando se selecciona un proyecto
  async function cargarFases(projectId: string) {
    const supabase = createClient();
    setLoadingFases(true);
    setFases([]);
    setFaseSeleccionada("");
    setCuotasPendientes([]);
    setCuotaSeleccionada("");

    try {
      // Obtener presupuesto del proyecto
      const { data: presupuesto, error: errorPresupuesto } = await supabase
        .from("presupuestos")
        .select("id")
        .eq("project_id", projectId)
        .single();

      if (errorPresupuesto || !presupuesto) {
        setFases([]);
        return;
      }

      setPresupuestoId(presupuesto.id);

      // Obtener fases del presupuesto
      const { data: fasesData, error: errorFases } = await supabase
        .from("fases")
        .select("*")
        .eq("presupuesto_id", presupuesto.id)
        .order("orden", { ascending: true });

      if (errorFases) {
        console.error("Error al obtener fases:", errorFases);
        setFases([]);
        return;
      }

      setFases(fasesData || []);
    } catch (error) {
      console.error("Error cargando fases:", error);
    } finally {
      setLoadingFases(false);
    }
  }

  // Cargar cuotas cuando se selecciona una fase
  async function cargarCuotas(faseId: string) {
    const supabase = createClient();
    setLoadingCuotas(true);
    setCuotasPendientes([]);
    setCuotaSeleccionada("");

    try {
      const { data: cuotas, error: errorCuotas } = await supabase
        .from("pago_cuotas")
        .select("*")
        .eq("fase_id", faseId)
        .eq("estado", "Pendiente de pago")
        .order("cuota", { ascending: true });

      if (errorCuotas) {
        console.error("Error al obtener cuotas:", errorCuotas);
        setCuotasPendientes([]);
        return;
      }

      setCuotasPendientes(cuotas || []);
    } catch (error) {
      console.error("Error cargando cuotas:", error);
    } finally {
      setLoadingCuotas(false);
    }
  }

  // Función para subir factura
  async function uploadFactura(file: File): Promise<string | null> {
    const supabase = createClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `ingresos/${fileName}`;

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

  const filtrados = proyectosConPresupuesto.filter((p) =>
    p.title.toLowerCase().includes(busqueda.toLowerCase())
  );

  async function handleSubmit() {
    const supabase = createClient();

    if (!descripcion.trim() || monto <= 0) {
      console.warn("Falta descripción o monto inválido");
      return;
    }

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

      if (isEditing && ingresoToEdit) {
        // MODO EDICIÓN
        const { error } = await supabase
          .from("Ingresos")
          .update({
            Ingreso: monto,
            Descripcion: descripcion,
            es_recurrente: esRecurrente,
            fecha_recurrente: esRecurrente ? fechaRecurrente : null,
            intervalo: esRecurrente ? intervalo : null,
            factura_url: finalFacturaUrl,
            created_at: new Date(fechaIngreso).toISOString(),
          })
          .eq("id", ingresoToEdit.id);

        if (error) throw error;

        const { error: errorHistory } = await supabase
          .from("historial_actividad")
          .insert([
            {
              usuario_modificador_id: user?.id,
              accion: "Editó un ingreso",
              usuario_modificado: projectTitle || ingresoToEdit.nombre,
              seccion: "PNL",
              detalles: `Monto: $${monto.toFixed(2)} - ${descripcion}`,
            },
          ]);

        if (errorHistory) throw errorHistory;
      } else {
        // MODO AGREGAR
        const nombreIngreso =
          categoria === "Proyectos"
            ? `Proyecto: ${projectTitle}`
            : `Servicio: ${descripcion.substring(0, 50)}`;

        const { error } = await supabase.from("Ingresos").insert({
          nombre: nombreIngreso,
          categoria: categoria,
          Ingreso: monto,
          Descripcion: descripcion,
          created_at: new Date(fechaIngreso).toISOString(),
          pago_cuotas_id: cuotaSeleccionada || null,
          presupuesto_id: presupuestoId || null,
          es_recurrente: esRecurrente,
          fecha_recurrente: esRecurrente ? fechaRecurrente : null,
          intervalo: esRecurrente ? intervalo : null,
          factura_url: finalFacturaUrl,
        });

        if (error) throw error;

        // Si se seleccionó una cuota, marcarla como pagada
        if (cuotaSeleccionada) {
          const { error: errorPagoCuota } = await supabase
            .from("pago_cuotas")
            .update({
              estado: "Pagada",
              factura_url: finalFacturaUrl,
            })
            .eq("id", cuotaSeleccionada);
          if (errorPagoCuota) throw errorPagoCuota;
        }

        const { error: errorHistory } = await supabase
          .from("historial_actividad")
          .insert([
            {
              usuario_modificador_id: user?.id,
              accion: "Añadió un ingreso",
              usuario_modificado:
                categoria === "Proyectos" ? projectTitle : "Servicios",
              seccion: "PNL",
              detalles: `${categoria} - $${monto.toFixed(2)} - ${descripcion}`,
            },
          ]);

        if (errorHistory) throw errorHistory;
      }

      // Reset form
      setMonto(0);
      setDescripcion("");
      setProject("");
      setProjectTitle("");
      setPresupuestoId("");
      setBusqueda("");
      setFases([]);
      setFaseSeleccionada("");
      setCuotasPendientes([]);
      setCuotaSeleccionada("");
      setEsRecurrente(false);
      setFechaRecurrente("");
      setIntervalo("1 month");
      setFacturaFile(null);
      setFacturaUrl(null);
      await refetchIngresos();
      onClose();
    } catch (error) {
      console.error("Error al guardar ingreso:", error);
    } finally {
      setUploadingFactura(false);
    }
  }

  if (isLoading)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="text-gray-700 dark:text-gray-300">Cargando...</div>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {isEditing ? "Editar Ingreso" : "Agregar Ingreso"}
        </h2>

        {/* SELECT CATEGORÍA - Solo en modo agregar */}
        {!isEditing && (
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría
            </label>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => setCategoria("Proyectos")}
                className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition ${
                  categoria === "Proyectos"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                📁 Proyectos
              </button>
              <button
                type="button"
                onClick={() => setCategoria("Servicios")}
                className={`flex-1 py-2.5 px-4 rounded-lg border-2 font-medium transition ${
                  categoria === "Servicios"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                    : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                }`}
              >
                🛠️ Servicios
              </button>
            </div>
          </div>
        )}

        {/* SECCIÓN PROYECTOS */}
        {!isEditing && categoria === "Proyectos" && (
          <div className="space-y-3 mb-4">
            {/* SELECT PROYECTO */}
            <div className="relative w-full">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Proyecto
              </label>
              <button
                ref={buttonRef}
                onClick={() => setOpen(!open)}
                className="w-full mt-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-left bg-white dark:bg-gray-700 flex justify-between items-center text-gray-900 dark:text-white"
              >
                <span className={!project ? "text-gray-400" : ""}>
                  {proyectosConPresupuesto.find((p) => p.id === project)
                    ?.title || "Seleccionar proyecto"}
                </span>
                <span className="text-gray-400 text-sm">▼</span>
              </button>

              {open && (
                <div
                  ref={panelRef}
                  className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg p-2"
                >
                  <input
                    autoFocus
                    type="text"
                    placeholder="Buscar proyecto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-2 mb-2"
                  />

                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filtrados.length > 0 ? (
                      filtrados.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => {
                            setProjectTitle(p.title);
                            setProject(p.id);
                            setOpen(false);
                            setBusqueda("");
                            cargarFases(p.id);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white"
                        >
                          {p.title}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
                        No se encontraron proyectos con presupuesto
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SELECT FASE */}
            {project && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fase
                </label>
                {loadingFases ? (
                  <div className="mt-1 p-2.5 text-gray-500 dark:text-gray-400 text-sm">
                    Cargando fases...
                  </div>
                ) : fases.length > 0 ? (
                  <select
                    value={faseSeleccionada}
                    onChange={(e) => {
                      const faseId = e.target.value;
                      setFaseSeleccionada(faseId);
                      if (faseId) {
                        cargarCuotas(faseId);
                      } else {
                        setCuotasPendientes([]);
                        setCuotaSeleccionada("");
                      }
                    }}
                    className="w-full mt-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Seleccionar fase...</option>
                    {fases.map((fase) => (
                      <option key={fase.id} value={fase.id}>
                        {fase.nombre} — ${fase.monto.toLocaleString()} (
                        {fase.estado})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 p-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-yellow-700 dark:text-yellow-400 text-sm">
                    Este proyecto no tiene fases creadas
                  </div>
                )}
              </div>
            )}

            {/* SELECT CUOTA */}
            {faseSeleccionada && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cuota a pagar
                </label>
                {loadingCuotas ? (
                  <div className="mt-1 p-2.5 text-gray-500 dark:text-gray-400 text-sm">
                    Cargando cuotas...
                  </div>
                ) : cuotasPendientes.length > 0 ? (
                  <select
                    value={cuotaSeleccionada}
                    onChange={(e) => {
                      const cuotaId = e.target.value;
                      setCuotaSeleccionada(cuotaId);

                      const cuota = cuotasPendientes.find(
                        (c) => c.id === cuotaId
                      );
                      if (cuota) {
                        setMonto(cuota.monto);
                        setDescripcion(cuota.detalle);
                      } else {
                        setMonto(0);
                        setDescripcion("");
                      }
                    }}
                    className="w-full mt-1 border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Seleccionar cuota...</option>
                    {cuotasPendientes.map((cuota) => (
                      <option key={cuota.id} value={cuota.id}>
                        Cuota #{cuota.cuota} — {cuota.detalle} — $
                        {cuota.monto.toLocaleString()}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="mt-1 p-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm">
                    ✓ Todas las cuotas de esta fase están pagadas
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* INPUTS */}
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Monto
            </label>
            <input
              type="number"
              placeholder="Monto"
              value={monto || ""}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2.5 mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Descripción
            </label>
            <input
              type="text"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg p-2.5 mt-1"
            />
          </div>

          {/* UPLOAD FACTURA */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Factura (PDF, PNG, JPG, WEBP - máx 10MB)
            </label>

            {facturaUrl || facturaFile ? (
              <div className="mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-between">
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
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                    {facturaFile?.name || "Factura adjunta"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {facturaUrl && !facturaFile && (
                    <a
                      href={facturaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
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
                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
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
                className="mt-1 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition text-center"
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
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
              id="esRecurrenteIngreso"
              checked={esRecurrente}
              onChange={(e) => setEsRecurrente(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 cursor-pointer"
            />
            <label
              htmlFor="esRecurrenteIngreso"
              className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Es recurrente (se repite automáticamente)
            </label>
          </div>

          {/* CAMPOS DE RECURRENCIA */}
          {esRecurrente && (
            <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Próxima fecha de cobro
                </label>
                <input
                  type="date"
                  value={fechaRecurrente}
                  onChange={(e) => setFechaRecurrente(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-2 mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Repetir cada
                </label>
                <select
                  value={intervalo}
                  onChange={(e) => setIntervalo(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg p-2 mt-1 cursor-pointer"
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

        {/* BOTONES */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-700 dark:text-gray-300"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              uploadingFactura ||
              descripcion.trim() === "" ||
              monto <= 0 ||
              (esRecurrente && !fechaRecurrente) ||
              (!isEditing &&
                categoria === "Proyectos" &&
                !!project &&
                !!faseSeleccionada &&
                cuotasPendientes.length > 0 &&
                !cuotaSeleccionada)
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
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
