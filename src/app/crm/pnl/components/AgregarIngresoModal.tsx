"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useClientProject } from "@/hooks/admin/useClients";
import { useAuth } from "@/hooks/useAuth";

type Props = {
  onClose: () => void;
  refetchIngresos: () => Promise<void> | void;
};
export const argentinaNow = new Date().toLocaleString("en-US", {
  timeZone: "America/Argentina/Buenos_Aires",
});
export type cuotas = {
  id: number;
  cuota: string;
  detalle: string;
  monto: number;
  presupuesto_id: string;
  vencimiento: string;
};
export function ModalAgregarIngreso({ onClose, refetchIngresos }: Props) {
  const { user } = useAuth();
  const { data: dataClientProject = [], isLoading } = useClientProject();

  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [project, setProject] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [cuotasPendientes, setCuotasPendientes] = useState<cuotas[]>([]);
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState(0);

  const [busqueda, setBusqueda] = useState("");
  const [open, setOpen] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ✅ cerrar dropdown al hacer click afuera
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
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
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

    // Obtener presupuesto del proyecto
    const { data: presupuesto, error: errorPresupuesto } = await supabase
      .from("presupuestos")
      .select("id")
      .eq("project_id", projectId)
      .single();

    if (errorPresupuesto || !presupuesto) {
      setCuotasPendientes([]);
      return;
    }

    // Obtener cuotas pendientes de ese presupuesto
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

  async function agregarEgreso() {
    const supabase = createClient();

    // ✅ validación nueva que pediste: solo descripción y monto > 0
    if (!descripcion.trim() || monto <= 0) {
      console.warn("Falta descripción o monto inválido");
      return;
    }

    try {
      const { error } = await supabase.from("Ingresos").insert({
        nombre: `Proyecto: ${projectTitle}`,
        Ingreso: monto,
        Descripcion: descripcion,
        created_at: new Date(argentinaNow).toISOString(),
        pago_cuota_id: cuotaSeleccionada,
      });

      const { error: errorPagoCuota } = await supabase
        .from("pago_cuotas")
        .update({
          estado: "Pagada",
        })
        .eq("id", cuotaSeleccionada);
      if (errorPagoCuota) throw errorPagoCuota;
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

      if (error) throw error;

      setMonto(0);
      setDescripcion("");
      setProject("");
      setBusqueda("");
      await refetchIngresos();
      onClose();
    } catch (error) {
      console.error("Error al agregar egreso:", error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200">
        <h2 className="text-xl font-semibold mb-4">Agregar Ingreso</h2>

        {/* ✅ SELECT OPCIONAL */}
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
                    No se encontraron usuarios
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        {project && cuotasPendientes.length > 0 && (
          <div className="w-full mt-3">
            <label className="text-sm text-gray-600">
              Seleccionar cuota a pagar
            </label>
            <select
              value={cuotaSeleccionada}
              onChange={(e) => {
                const cuotaId = Number(e.target.value);
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

        {/* ✅ INPUTS OBLIGATORIOS */}
        <div className="space-y-3">
          <input
            type="number"
            placeholder="Monto"
            value={monto || ""}
            onChange={(e) => setMonto(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
          />

          <input
            type="text"
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>

        {/* ✅ BOTONES */}
        <div className="flex justify-end gap-2 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Cancelar
          </button>

          {/* ✅ Solo validar monto y descripción */}
          <button
            type="button"
            onClick={agregarEgreso}
            disabled={Boolean(project) && (!cuotaSeleccionada || monto <= 0)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400 cursor-pointer"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
