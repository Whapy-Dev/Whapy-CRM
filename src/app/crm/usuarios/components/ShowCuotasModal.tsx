"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Client, Project } from "../page";
import { argentinaNow } from "../../pnl/components/AgregarIngresoModal";
import { useAuth } from "@/hooks/useAuth";

type Cuota = {
  id: string;
  monto: number;
  vencimiento: string;
  estado: string;
  detalle?: string;
};

type ShowCuotasModalProps = {
  show: boolean;
  client: Client;
  project: Project;
  onClose: () => void;
  refetchProfile: () => void;
};
type Presupuesto = {
  id: string;
  divisa: string;
  monto: number;
  vencimiento: string;
  estado: string;
  user_id?: string;
  project_id: string;
  created_at: string;
} | null;
export default function ShowCuotasModal({
  show,
  client,
  project,
  onClose,
  refetchProfile,
}: ShowCuotasModalProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [presupuesto, setPresupuesto] = useState<Presupuesto>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!show || !project?.id) return;

    const fetchData = async () => {
      setLoading(true);

      // Obtener presupuesto
      const { data: presupuestoData, error: presupuestoError } = await supabase
        .from("presupuestos")
        .select("*")
        .eq("project_id", project.id)
        .single();

      if (presupuestoError || !presupuestoData) {
        console.error(presupuestoError);
        setLoading(false);
        return;
      }
      setPresupuesto(presupuestoData);

      // Obtener cuotas
      const { data: cuotasData, error: cuotasError } = await supabase
        .from("pago_cuotas")
        .select("*")
        .eq("presupuesto_id", presupuestoData.id)
        .order("vencimiento", { ascending: true });

      if (cuotasError) {
        console.error(cuotasError);
        setLoading(false);
        return;
      }

      setCuotas(cuotasData || []);
      setLoading(false);
    };

    fetchData();
  }, [show, project]);

  const marcarComoPagada = async (cuota: Cuota) => {
    // Actualizar estado de la cuota
    const { error } = await supabase
      .from("pago_cuotas")
      .update({ estado: "Pagada" })
      .eq("id", cuota.id);

    if (error) {
      console.error(error);
      return;
    }

    // Guardar en tabla Ingresos usando monto y detalle de la cuota
    const { error: errorIngreso } = await supabase.from("Ingresos").insert({
      nombre: `Proyecto: ${project.title}`,
      Ingreso: cuota.monto,
      Descripcion: cuota.detalle || "",
      created_at: new Date(argentinaNow).toISOString(),
      pago_cuotas_id: cuota.id,
    });

    if (errorIngreso) {
      console.error(errorIngreso);
      return;
    }
    const { error: errorHistory } = await supabase
      .from("historial_actividad")
      .insert([
        {
          usuario_modificador_id: user?.id,
          accion: "Añadió un ingreso",
          usuario_modificado: project.title,
          seccion: "PNL",
        },
      ]);

    if (errorHistory) throw errorHistory;

    // Actualizar UI
    setCuotas((prev) =>
      prev.map((c) => (c.id === cuota.id ? { ...c, estado: "Pagada" } : c))
    );

    refetchProfile();
  };

  if (!show) return null;

  const pagadasCount = cuotas.filter((c) => c.estado === "Pagada").length;
  const progreso = (pagadasCount / (cuotas.length || 1)) * 100;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 flex flex-col gap-6">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">{client.nombre}</h2>
          <button
            className="text-gray-500 hover:text-gray-800 font-bold text-lg"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* PRESUPUESTO */}
        {presupuesto && (
          <div className="bg-gray-100 rounded-xl p-4">
            <p>
              <b>Total:</b> ${presupuesto.monto}
            </p>
            <p>
              <b>Cuotas:</b> {cuotas.length}
            </p>
            <div className="w-full h-2 bg-gray-300 rounded-full mt-2">
              <div
                className="h-2 bg-green-500 rounded-full transition-all"
                style={{ width: `${progreso}%` }}
              />
            </div>
            <p className="text-xs mt-1">
              {pagadasCount} de {cuotas.length} pagadas
            </p>
          </div>
        )}

        {/* CUOTAS */}
        {loading ? (
          <p className="text-center text-sm opacity-60">Cargando cuotas...</p>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-3">
            {cuotas.map((cuota) => (
              <div
                key={cuota.id}
                className="flex justify-between items-center bg-gray-50 rounded-xl p-4 shadow hover:shadow-md transition"
              >
                <div>
                  <p>
                    <b>Monto:</b> ${cuota.monto}
                  </p>
                  <p>
                    <b>Vencimiento:</b>{" "}
                    {new Date(cuota.vencimiento).toLocaleDateString()}
                  </p>
                  <p>
                    <b>Estado:</b> {cuota.estado}
                  </p>
                  {cuota.detalle && (
                    <p>
                      <b>Detalle:</b> {cuota.detalle}
                    </p>
                  )}
                </div>
                <button
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    cuota.estado === "Pagada"
                      ? "bg-gray-300 text-gray-600 cursor-default"
                      : "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                  }`}
                  onClick={() => marcarComoPagada(cuota)}
                  disabled={cuota.estado === "Pagada"}
                >
                  {cuota.estado === "Pagada"
                    ? "✅ Pagada"
                    : "Marcar como pagada"}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* FOOTER */}
        <button
          className="w-full py-2 bg-gray-800 text-white rounded-xl font-medium hover:bg-black transition"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}
