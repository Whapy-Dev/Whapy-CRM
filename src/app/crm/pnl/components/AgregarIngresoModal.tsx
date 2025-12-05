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
};

type Props = {
  onClose: () => void;
  refetchIngresos: () => Promise<void> | void;
  ingresoToEdit?: Ingresos | null;
};

export const argentinaNow = new Date().toLocaleString("en-US", {
  timeZone: "America/Argentina/Buenos_Aires",
});

export type cuotas = {
  id: string;
  cuota: string;
  detalle: string;
  monto: number;
  presupuesto_id: string;
  vencimiento: string;
};

export function ModalAgregarIngreso({
  onClose,
  refetchIngresos,
  ingresoToEdit,
}: Props) {
  const { user } = useAuth();
  const { data: dataClientProject = [], isLoading } = useClientProject();

  const isEditing = Boolean(ingresoToEdit);

  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [project, setProject] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [cuotasPendientes, setCuotasPendientes] = useState<cuotas[]>([]);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState("");

  const [busqueda, setBusqueda] = useState("");
  const [open, setOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Pre-cargar datos cuando se está editando
  useEffect(() => {
    if (ingresoToEdit) {
      setMonto(ingresoToEdit.Ingreso || 0);
      setDescripcion(ingresoToEdit.Descripcion || "");
      // Extraer el título del proyecto del nombre si existe
      if (ingresoToEdit.nombre?.startsWith("Proyecto: ")) {
        setProjectTitle(ingresoToEdit.nombre.replace("Proyecto: ", ""));
      }
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

  if (isLoading)
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
        <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200">
          <div>Cargando...</div>
        </div>
      </div>
    );

  const filtrados = dataClientProject.filter((p) =>
    p.title.toLowerCase().includes(busqueda.toLowerCase())
  );

  async function cargarCuotas(projectId: string) {
    const supabase = createClient();

    const { data: presupuesto, error: errorPresupuesto } = await supabase
      .from("presupuestos")
      .select("id")
      .eq("project_id", projectId)
      .single();

    if (errorPresupuesto || !presupuesto) {
      setCuotasPendientes([]);
      return;
    }

    const { data: cuotas, error: errorCuotas } = await supabase
      .from("pago_cuotas")
      .select("*")
      .eq("presupuesto_id", presupuesto.id)
      .eq("estado", "Pendiente de pago");

    if (errorCuotas) {
      console.error("Error al obtener cuotas:", errorCuotas);
      setCuotasPendientes([]);
      return;
    }

    setCuotasPendientes(cuotas || []);
  }

  async function handleSubmit() {
    const supabase = createClient();

    if (!descripcion.trim() || monto <= 0) {
      console.warn("Falta descripción o monto inválido");
      return;
    }

    try {
      if (isEditing && ingresoToEdit) {
        // MODO EDICIÓN
        const { error } = await supabase
          .from("Ingresos")
          .update({
            Ingreso: monto,
            Descripcion: descripcion,
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
            },
          ]);

        if (errorHistory) throw errorHistory;
      } else {
        // MODO AGREGAR
        const { error } = await supabase.from("Ingresos").insert({
          nombre: `Proyecto: ${projectTitle}`,
          Ingreso: monto,
          Descripcion: descripcion,
          created_at: new Date(argentinaNow).toISOString(),
          pago_cuotas_id: cuotaSeleccionada,
        });

        if (error) throw error;

        if (cuotaSeleccionada) {
          const { error: errorPagoCuota } = await supabase
            .from("pago_cuotas")
            .update({ estado: "Pagada" })
            .eq("id", cuotaSeleccionada);
          if (errorPagoCuota) throw errorPagoCuota;
        }

        const { error: errorHistory } = await supabase
          .from("historial_actividad")
          .insert([
            {
              usuario_modificador_id: user?.id,
              accion: "Añadió un ingreso",
              usuario_modificado: projectTitle,
              seccion: "PNL",
            },
          ]);

        if (errorHistory) throw errorHistory;
      }

      setMonto(0);
      setDescripcion("");
      setProject("");
      setBusqueda("");
      await refetchIngresos();
      onClose();
    } catch (error) {
      console.error("Error al guardar ingreso:", error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">
          {isEditing ? "Editar Ingreso" : "Agregar Ingreso"}
        </h2>

        {/* SELECT PROYECTO - Solo mostrar en modo agregar */}
        {!isEditing && (
          <div className="relative w-full mb-3">
            <button
              ref={buttonRef}
              onClick={() => setOpen(!open)}
              className="w-full border border-gray-300 rounded-lg p-2 text-left bg-white flex justify-between items-center"
            >
              <span>
                {dataClientProject.find((p) => p.id === project)?.title ||
                  "Seleccionar proyecto (opcional)"}
              </span>
              <span className="text-gray-400 text-sm">▼</span>
            </button>

            {open && (
              <div
                ref={panelRef}
                className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg p-2"
              >
                <input
                  autoFocus
                  type="text"
                  placeholder="Buscar proyecto..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 mb-2"
                />

                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filtrados.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setProjectTitle(p.title);
                        setProject(p.id);
                        setOpen(false);
                        setBusqueda("");
                        cargarCuotas(p.id);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-gray-100 rounded-lg"
                    >
                      {p.title}
                    </button>
                  ))}

                  {filtrados.length === 0 && (
                    <div className="px-3 py-1 text-gray-500 text-sm">
                      No se encontraron proyectos
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SELECT CUOTAS - Solo en modo agregar */}
        {!isEditing && project && cuotasPendientes.length > 0 && (
          <div className="w-full mb-3">
            <label className="text-sm text-gray-600">
              Seleccionar cuota a pagar
            </label>
            <select
              value={cuotaSeleccionada}
              onChange={(e) => {
                const cuotaId = e.target.value;
                setCuotaSeleccionada(cuotaId);

                const cuota = cuotasPendientes.find((c) => c.id === cuotaId);
                if (cuota) {
                  setMonto(cuota.monto);
                  setDescripcion(cuota.detalle);
                }
              }}
              className="w-full border border-gray-300 rounded-lg p-2 bg-white mt-1"
            >
              <option value="">Elegir cuota...</option>
              {cuotasPendientes.map((cuota) => (
                <option key={cuota.id} value={cuota.id}>
                  Cuota #{cuota.cuota} — {cuota.detalle} — ${cuota.monto}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* INPUTS */}
        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-600">Monto</label>
            <input
              type="number"
              placeholder="Monto"
              value={monto || ""}
              onChange={(e) => setMonto(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Descripción</label>
            <input
              type="text"
              placeholder="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mt-1"
            />
          </div>
        </div>

        {/* BOTONES */}
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
              isEditing
                ? !descripcion.trim() || monto <= 0
                : Boolean(project) && (!cuotaSeleccionada || monto <= 0)
            }
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400 cursor-pointer"
          >
            {isEditing ? "Guardar" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
