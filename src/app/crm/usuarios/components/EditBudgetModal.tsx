"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Calendar } from "lucide-react";
import { Project } from "../page";

type EditBudgetModalProps = {
  show: boolean;
  projects: Project[];
  clientNombre: string;
  onClose: () => void;
  refetchProfile: () => void;
};

function i18nPlural(cuota: number, total: number) {
  return `${cuota} de ${total} cuotas`;
}
type AnexoDB = {
  id: string;
  monto: number;

  presupuesto_id?: string;
};
export default function EditBudgetModal({
  show,
  projects,
  clientNombre,
  onClose,
  refetchProfile,
}: EditBudgetModalProps) {
  const supabase = createClient();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [estado, setEstado] = useState<string>("");
  const [tab, setTab] = useState<"editar" | "anexos">("editar");

  const [anexos, setAnexos] = useState<AnexoDB[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newAnexo, setNewAnexo] = useState<number | "">("");

  const [cuotas, setCuotas] = useState<number>(1);
  const [montoTotal, setMontoTotal] = useState<number>(0);
  const [editarCuotas, setEditarCuotas] = useState(false);
  const [montosCuotas, setMontosCuotas] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Al seleccionar proyecto → cargar datos y anexos
  useEffect(() => {
    const fetchAnexos = async () => {
      const presupuestoId = selectedProject?.presupuesto?.id;
      if (!presupuestoId) return;

      const { data } = await supabase
        .from("anexos")
        .select("*")
        .eq("presupuesto_id", presupuestoId);

      setAnexos(data ?? []);
    };

    if (selectedProject?.presupuesto) {
      setEstado(selectedProject.presupuesto.estado);
      setMontoTotal(selectedProject.presupuesto.monto);

      setCuotas(1);
      setEditarCuotas(false);
      setMontosCuotas(Array(1).fill(0));

      fetchAnexos();
    }
  }, [selectedProject]);

  if (!show) return null;

  const handleCuotasChange = (n: number) => {
    if (n < 1) return;
    setCuotas(n);
    setMontosCuotas(Array(n).fill(0));
  };

  const handleMontoCuotaChange = (i: number, v: number) => {
    const copy = [...montosCuotas];
    copy[i] = v;
    setMontosCuotas(copy);
  };

  const generarFechasVencimiento = (n: number) => {
    const fechas: string[] = [];
    const base = new Date();
    for (let i = 0; i < n; i++) {
      const f = new Date(base);
      f.setDate(base.getDate() + 30 * i);
      fechas.push(f.toISOString());
    }
    return fechas;
  };

  const agregarAnexo = async () => {
    const presupuestoId = selectedProject?.presupuesto?.id;
    if (!presupuestoId || newAnexo === "" || newAnexo < 0) return;

    setLoading(true);
    setShowAdd(false);

    await supabase.from("anexos").insert([
      {
        monto: newAnexo,
        presupuesto_id: presupuestoId,
      },
    ]);

    const { data } = await supabase
      .from("anexos")
      .select("*")
      .eq("presupuesto_id", presupuestoId);

    setAnexos(data ?? []);
    setNewAnexo("");
    setLoading(false);
  };

  const submitBudgetLogic = async () => {
    if (!selectedProject?.presupuesto) return;
    setLoading(true);

    try {
      const nombreProyecto = selectedProject.title;
      const idProyecto = selectedProject.id;
      const presupuestoId = selectedProject.presupuesto.id;
      const divisa = selectedProject.presupuesto.divisa;

      // 1. Actualizar estado
      await supabase
        .from("presupuestos")
        .update({ estado })
        .eq("project_id", idProyecto);

      // 2. Si aceptado → insertar cuotas + ingresos
      if (estado === "Aceptado") {
        if (cuotas === 1) {
          const { error } = await supabase.from("pago_cuotas").insert([
            {
              monto: montoTotal,
              presupuesto_id: selectedProject.presupuesto.id,
              created_at: new Date().toISOString(),
              vencimiento: new Date().toISOString(),
              estado: "Pagada",
              cuota: 1,
              detalle: "1/1",
              divisa,
            },
          ]);

          if (error) throw error;

          const { error: errorCuotas } = await supabase
            .from("Ingresos")
            .insert([
              {
                nombre: `Proyecto: ${nombreProyecto}`,
                presupuesto_id: presupuestoId,
                Ingreso: montoTotal,
                Descripcion: `Cuota ${i18nPlural(1, cuotas)}`,
                divisa,
              },
            ]);
          if (errorCuotas) throw errorCuotas;
          setLoading(false);
          refetchProfile();
          onClose();
          return;
        }

        const fechas = generarFechasVencimiento(cuotas);

        // 1️⃣ Insertamos la PRIMER cuota y guardamos el ID
        const { data: primeraCuota, error: errorPrimera } = await supabase
          .from("pago_cuotas")
          .insert([
            {
              monto: montosCuotas[0],
              presupuesto_id: presupuestoId,
              created_at: new Date().toISOString(),
              vencimiento: fechas[0],
              estado: "Pagada",
              cuota: 1,
              detalle: i18nPlural(1, cuotas),
              divisa,
            },
          ])
          .select()
          .single();

        if (errorPrimera) throw errorPrimera;

        const pagoCuotasIdPrimera = primeraCuota.id; // 👈 ID guardado correctamente

        // 2️⃣ Insertamos las demás cuotas si existen
        for (let i = 1; i < cuotas; i++) {
          await supabase.from("pago_cuotas").insert([
            {
              monto: montosCuotas[i],
              presupuesto_id: presupuestoId,
              created_at: new Date().toISOString(),
              vencimiento: fechas[i],
              estado: "Pendiente de pago",
              cuota: i + 1,
              detalle: i18nPlural(i + 1, cuotas),
              divisa,
            },
          ]);
        }

        // 3️⃣ Ahora insertamos el ingreso usando el ID de la primera cuota
        const { error } = await supabase.from("Ingresos").insert([
          {
            nombre: `Proyecto: ${nombreProyecto}`,
            presupuesto_id: presupuestoId,
            pago_cuotas_id: pagoCuotasIdPrimera, // 👈 Acá va el ID plano
            Ingreso: montosCuotas[0],
            Descripcion: `Cuota ${i18nPlural(1, cuotas)}`,
            divisa,
          },
        ]);

        if (error) throw error;
      }

      // 3. Si rechazado → solo actualizar
      if (estado === "Rechazado") {
        console.warn(
          `Presupuesto del proyecto ${idProyecto} rechazado por ${clientNombre}`
        );
      }

      setEstado("");
      setTab("editar");

      setAnexos([]);
      setShowAdd(false);
      setNewAnexo("");

      setCuotas(1);
      setMontoTotal(0);
      setEditarCuotas(false);
      setMontosCuotas([]);

      refetchProfile();
      onClose();
    } catch (error) {
      console.error("Error en budget logic:", error);
    } finally {
      setLoading(false);
    }
  };
  const borrarAnexo = async (anexoId: string) => {
    if (!selectedProject?.presupuesto?.id) return;
    setLoading(true);

    try {
      await supabase.from("anexos").delete().eq("id", anexoId);

      const { data } = await supabase
        .from("anexos")
        .select("*")
        .eq("presupuesto_id", selectedProject.presupuesto.id);

      setAnexos(data ?? []);
    } catch (error) {
      console.error("Error borrando anexo:", error);
    }

    setLoading(false);
  };

  const borrarTodosLosAnexos = async () => {
    if (!selectedProject?.presupuesto?.id) return;
    setLoading(true);

    try {
      await supabase
        .from("anexos")
        .delete()
        .eq("presupuesto_id", selectedProject.presupuesto.id);

      setAnexos([]);
    } catch (error) {
      console.error("Error borrando todos los anexos:", error);
    }

    setLoading(false);
  };

  const borrarPresupuesto = async () => {
    if (!selectedProject?.presupuesto?.id) return;
    setLoading(true);

    try {
      // 1. Borrar anexos asociados
      await supabase
        .from("anexos")
        .delete()
        .eq("presupuesto_id", selectedProject.presupuesto.id);
      setAnexos([]);
      await supabase
        .from("presupuestos_employees")
        .delete()
        .eq("presupuestos_id", selectedProject.presupuesto.id);

      await supabase
        .from("pago_cuotas")
        .delete()
        .eq("presupuesto_id", selectedProject.presupuesto.id)
        .eq("estado", "Pendiente de pago");
      // 2. Borrar presupuesto
      await supabase
        .from("presupuestos")
        .delete()
        .eq("project_id", selectedProject.id);
      setMontoTotal(0);
      setEstado("");
      refetchProfile();
      onClose();
    } catch (error) {
      console.error("Error borrando presupuesto:", error);
    }

    setLoading(false);
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-[900px] p-6 cursor-auto"
      >
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={22} />
          <h3 className="text-2xl font-bold">Gestión de Presupuestos</h3>
        </div>

        <div className="flex gap-6">
          {/* Sidebar de Proyectos */}
          <div className="w-72 border-r pr-4">
            <h4 className="text-lg font-semibold mb-2">Proyectos</h4>
            <div className="flex flex-col gap-2">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setSelectedProject(p);
                    setTab("editar");
                  }}
                  className={`text-left px-4 py-2 rounded-xl border transition cursor-pointer ${
                    selectedProject?.id === p.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Panel principal */}
          <div className="flex-1 space-y-4">
            {/* Tabs de editar/anexos */}
            {selectedProject && (
              <div className="flex gap-2 border-b pb-3">
                <button
                  onClick={() => setTab("editar")}
                  className={`px-4 py-2 rounded-t-lg cursor-pointer ${
                    tab === "editar"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Editar presupuesto
                </button>

                <button
                  onClick={() => setTab("anexos")}
                  className={`px-4 py-2 rounded-t-lg cursor-pointer ${
                    tab === "anexos"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  Anexos
                </button>
              </div>
            )}

            {/* TAB → Editar presupuesto */}
            {tab === "editar" && selectedProject && (
              <>
                <div>
                  <label className="font-medium">Estado del presupuesto</label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full border p-2 rounded-xl mt-1"
                  >
                    <option value="En revisión">En revisión</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="Aceptado">Aceptado</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium">Monto del presupuesto</label>
                  <input
                    type="number"
                    value={montoTotal}
                    readOnly
                    className="w-full border p-2 rounded-xl bg-gray-100 cursor-not-allowed mt-1"
                  />
                </div>

                {/* CUOTAS */}
                {estado === "Aceptado" && (
                  <>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="font-medium">
                          Cantidad de cuotas
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={cuotas}
                          onChange={(e) =>
                            handleCuotasChange(Number(e.target.value))
                          }
                          className="w-full border p-2 rounded-xl mt-1"
                        />
                      </div>

                      <div className="flex items-end pb-2">
                        <label className="inline-flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={editarCuotas}
                            onChange={(e) => setEditarCuotas(e.target.checked)}
                          />
                          Editar cuotas
                        </label>
                      </div>
                    </div>

                    {editarCuotas && (
                      <div className="flex gap-2 flex-wrap">
                        {montosCuotas.map((m, i) => (
                          <div key={i} className="w-32">
                            <label className="text-sm">Cuota {i + 1}</label>
                            <input
                              type="number"
                              value={m}
                              onChange={(e) =>
                                handleMontoCuotaChange(
                                  i,
                                  Number(e.target.value)
                                )
                              }
                              className="w-full border p-1 rounded-lg mt-1"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {/* al final del TAB editar presupuesto */}
                  </>
                )}
                <div className="pt-2">
                  <button
                    onClick={borrarPresupuesto}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition cursor-pointer"
                    disabled={loading}
                  >
                    Borrar presupuesto
                  </button>
                </div>
              </>
            )}

            {/* TAB → Anexos */}
            {tab === "anexos" && selectedProject && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  {anexos.map((ax) => (
                    <div
                      key={ax.id}
                      className="border rounded-xl p-3 shadow-sm"
                    >
                      <h5 className="font-semibold">Anexo</h5>
                      <p>Monto: ${ax.monto}</p>
                      <button
                        key={"del-" + ax.id}
                        onClick={() => borrarAnexo(ax.id)}
                        className="w-auto px-3 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700 transition cursor-pointer"
                        disabled={loading}
                      >
                        Borrar
                      </button>
                    </div>
                  ))}
                </div>

                {!showAdd ? (
                  <>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAdd(true)}
                        className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition cursor-pointer"
                      >
                        Agregar anexo
                      </button>
                      <button
                        onClick={() => borrarTodosLosAnexos()}
                        className="px-4 py-2 bg-red-700 text-white rounded-xl hover:bg-red-800 transition cursor-pointer"
                        disabled={loading}
                      >
                        Borrar todos los anexos
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex gap-2 items-end">
                    <input
                      type="number"
                      value={newAnexo}
                      onChange={(e) => setNewAnexo(Number(e.target.value))}
                      className="border p-2 rounded-lg w-40"
                      placeholder="Monto del anexo"
                    />

                    <button
                      onClick={agregarAnexo}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                      disabled={loading}
                    >
                      Subir
                    </button>

                    <button
                      onClick={() => {
                        setShowAdd(false);
                        setNewAnexo("");
                      }}
                      className="px-3 py-2 border rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={onClose}
                className="px-5 py-2 border rounded-xl hover:bg-gray-100 transition cursor-pointer"
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                onClick={submitBudgetLogic}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
                disabled={!selectedProject || loading}
              >
                {loading ? "Procesando…" : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
