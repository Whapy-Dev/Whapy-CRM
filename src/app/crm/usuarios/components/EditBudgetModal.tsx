"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar } from "lucide-react";
import { Project } from "../page";

type BudgetModalProps = {
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

export default function BudgetModal({
  show,
  projects,
  clientNombre,
  onClose,
  refetchProfile,
}: BudgetModalProps) {
  const { user } = useAuth();
  const supabase = createClient();

  // Estado compartido
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  // Estados para CREAR presupuesto (AssignBudgetModal)
  const [presupuestoEstado, setPresupuestoEstado] = useState("");
  const [presupuestoDivisa, setPresupuestoDivisa] = useState("");
  const [presupuesto, setPresupuesto] = useState("");
  const [anexo, setAnexo] = useState("");
  const [admins, setAdmins] = useState<{ id: string; nombre: string }[]>([]);
  const [assignedAdmins, setAssignedAdmins] = useState<string[]>([]);

  // Estados para EDITAR presupuesto (EditBudgetModal)
  const [estado, setEstado] = useState<string>("");
  const [tab, setTab] = useState<"editar" | "anexos">("editar");
  const [anexos, setAnexos] = useState<AnexoDB[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newAnexo, setNewAnexo] = useState<number | "">("");
  const [cuotas, setCuotas] = useState<number>(1);
  const [montoTotal, setMontoTotal] = useState<number>(0);
  const [editarCuotas, setEditarCuotas] = useState(false);
  const [montosCuotas, setMontosCuotas] = useState<number[]>([]);

  // Determinar si el proyecto seleccionado tiene presupuesto
  const tienePresupuesto = selectedProject?.presupuesto != null;

  // Fetch admins para crear presupuesto
  useEffect(() => {
    const fetchAdmins = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nombre, roles(rol)")
        .eq("role", "admin");

      if (error || !data) return;

      const flatAdmins = data.map((a) => ({
        id: a.id,
        nombre: a.nombre,
        rol: (a.roles && "rol" in a.roles ? a.roles.rol : "") || "",
      }));

      const ceoCooAdmins = flatAdmins.filter(
        (a) => a.rol === "CEO" || a.rol === "COO"
      );

      setAdmins(ceoCooAdmins);
    };

    fetchAdmins();
  }, []);

  // Al seleccionar proyecto con presupuesto → cargar datos y anexos
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

  // Calcular montos de cuotas
  useEffect(() => {
    if (!selectedProject?.presupuesto) return;

    if (!editarCuotas) {
      if (cuotas === 1) {
        setMontosCuotas([montoTotal]);
      } else {
        const dividido = montoTotal / cuotas;
        setMontosCuotas(Array(cuotas).fill(dividido));
      }
    }
  }, [montoTotal, cuotas, editarCuotas, selectedProject]);

  // Resetear estados al cambiar de proyecto
  useEffect(() => {
    if (!tienePresupuesto) {
      // Resetear estados de creación
      setPresupuesto("");
      setPresupuestoEstado("");
      setPresupuestoDivisa("");
      setAnexo("");
      setAssignedAdmins([]);
    }
    setTab("editar");
    setShowAdd(false);
    setNewAnexo("");
  }, [selectedProject, tienePresupuesto]);

  if (!show) return null;

  // ========== HANDLERS PARA CREAR PRESUPUESTO ==========
  const handleAdminCheck = (adminId: string) => {
    setAssignedAdmins((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleCreateBudget = async () => {
    if (!selectedProject) return;

    const p = Number(presupuesto) || 0;
    const a = Number(anexo) || 0;
    const presupuestoTotal = p + a;

    if (assignedAdmins.length < 1) {
      alert("Debés seleccionar mínimo 1 administrador");
      return;
    }
    if (presupuestoTotal <= 0) return;

    setLoading(true);
    try {
      const { data: presupuestoCreado, error } = await supabase
        .from("presupuestos")
        .insert([
          {
            divisa: presupuestoDivisa,
            monto: presupuestoTotal,
            estado: presupuestoEstado,
            project_id: selectedProject.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const inserts = assignedAdmins.map((adminId) => ({
        presupuestos_id: presupuestoCreado.id,
        user_id: adminId,
      }));

      const { error: errorEmployees } = await supabase
        .from("presupuestos_employees")
        .insert(inserts);

      if (errorEmployees) throw errorEmployees;

      const { error: errorHistory } = await supabase
        .from("historial_actividad")
        .insert([
          {
            usuario_modificador_id: user?.id,
            accion: "Creó un presupuesto",
            usuario_modificado: clientNombre,
            seccion: "Usuarios",
          },
        ]);

      if (errorHistory) throw errorHistory;

      // Limpiar y cerrar
      resetAllStates();
      refetchProfile();
    } catch (err) {
      console.error("Error asignando presupuesto:", err);
    } finally {
      setLoading(false);
    }
  };

  // ========== HANDLERS PARA EDITAR PRESUPUESTO ==========
  const validarSumaCuotas = () => {
    const suma = montosCuotas.reduce((a, b) => a + b, 0);
    return suma <= montoTotal;
  };

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

      if (editarCuotas && !validarSumaCuotas()) {
        alert("La suma de las cuotas supera el total del presupuesto ❌");
        setLoading(false);
        return;
      }

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

        const pagoCuotasIdPrimera = primeraCuota.id;
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

        const { error } = await supabase.from("Ingresos").insert([
          {
            nombre: `Proyecto: ${nombreProyecto}`,
            presupuesto_id: presupuestoId,
            pago_cuotas_id: pagoCuotasIdPrimera,
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

      resetAllStates();
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

  const resetAllStates = () => {
    setSelectedProject(null);
    setPresupuesto("");
    setPresupuestoEstado("");
    setPresupuestoDivisa("");
    setAnexo("");
    setAssignedAdmins([]);
    setEstado("");
    setTab("editar");
    setAnexos([]);
    setShowAdd(false);
    setNewAnexo("");
    setCuotas(1);
    setMontoTotal(0);
    setEditarCuotas(false);
    setMontosCuotas([]);
  };

  const handleClose = () => {
    resetAllStates();
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black/50 flex justify-center items-center backdrop-blur-sm z-50 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-[900px] max-h-[90vh] overflow-y-auto p-6 cursor-auto"
      >
        <div className="flex items-center gap-2 mb-5">
          <Calendar size={22} />
          <h3 className="text-2xl font-bold">Gestión de Presupuestos</h3>
        </div>

        <div className="flex gap-6">
          {/* Sidebar de Proyectos */}
          <div className="w-72 border-r pr-4">
            <h4 className="text-lg font-semibold mb-2">Proyectos</h4>
            <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className={`text-left px-4 py-2 rounded-xl border transition cursor-pointer ${
                    selectedProject?.id === p.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span>{p.title}</span>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                      p.presupuesto
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    } ${
                      selectedProject?.id === p.id
                        ? "!bg-white/20 !text-white"
                        : ""
                    }`}
                  >
                    {p.presupuesto ? "Con presupuesto" : "Sin presupuesto"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Panel principal */}
          <div className="flex-1 space-y-4">
            {!selectedProject ? (
              <div className="text-gray-500 text-center py-10">
                Seleccioná un proyecto para gestionar su presupuesto
              </div>
            ) : !tienePresupuesto ? (
              /* ========== FORMULARIO CREAR PRESUPUESTO ========== */
              <>
                <h4 className="text-lg font-semibold">
                  Crear presupuesto para: {selectedProject.title}
                </h4>

                <div className="space-y-3">
                  <select
                    value={presupuestoEstado}
                    onChange={(e) => setPresupuestoEstado(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl"
                  >
                    <option value="" disabled>
                      Seleccionar Estado
                    </option>
                    <option value="Sin presentar">Sin presentar</option>
                    <option value="Rechazado">Rechazado</option>
                    <option value="En revisión">En revisión</option>
                  </select>

                  <select
                    value={presupuestoDivisa}
                    onChange={(e) => setPresupuestoDivisa(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl"
                  >
                    <option value="" disabled>
                      Seleccionar Divisa
                    </option>
                    <option value="ARS">ARS</option>
                    <option value="USD">USD</option>
                  </select>

                  <input
                    type="number"
                    placeholder="Presupuesto"
                    value={presupuesto}
                    onChange={(e) => setPresupuesto(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl"
                  />

                  <input
                    type="number"
                    placeholder="Anexo"
                    value={anexo}
                    onChange={(e) => setAnexo(e.target.value)}
                    className="w-full px-4 py-2 border rounded-xl"
                  />

                  <div className="border p-3 rounded-xl">
                    <p className="text-sm font-medium mb-2">
                      Seleccionar administradores:
                    </p>
                    <div className="max-h-40 overflow-y-auto space-y-2">
                      {admins.map((admin) => (
                        <label
                          key={admin.id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={assignedAdmins.includes(admin.id)}
                            onChange={() => handleAdminCheck(admin.id)}
                          />
                          <span className="text-gray-700">{admin.nombre}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Debés seleccionar al menos 1
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-xl cursor-pointer"
                    disabled={loading}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleCreateBudget}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    disabled={loading || (!presupuesto && !anexo)}
                  >
                    {loading ? "Asignando…" : "Asignar presupuesto"}
                  </button>
                </div>
              </>
            ) : (
              /* ========== FORMULARIO EDITAR PRESUPUESTO ========== */
              <>
                {/* Tabs de editar/anexos */}
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

                {/* TAB → Editar presupuesto */}
                {tab === "editar" && (
                  <>
                    <div>
                      <label className="font-medium">
                        Estado del presupuesto
                      </label>
                      <select
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        className="w-full border p-2 rounded-xl mt-1"
                      >
                        <option value="Sin presentar">Sin presentar</option>
                        <option value="En revisión">En revisión</option>
                        <option value="Rechazado">Rechazado</option>
                        <option value="Aceptado">Aceptado</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-medium">
                        Monto del presupuesto
                      </label>
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
                                onChange={(e) =>
                                  setEditarCuotas(e.target.checked)
                                }
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
                {tab === "anexos" && (
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
                            onClick={() => borrarAnexo(ax.id)}
                            className="w-auto px-3 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700 transition cursor-pointer mt-2"
                            disabled={loading}
                          >
                            Borrar
                          </button>
                        </div>
                      ))}
                    </div>

                    {anexos.length === 0 && (
                      <p className="text-gray-500 text-sm">
                        No hay anexos creados
                      </p>
                    )}

                    {!showAdd ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowAdd(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition cursor-pointer"
                        >
                          Agregar anexo
                        </button>
                        {anexos.length > 0 && (
                          <button
                            onClick={borrarTodosLosAnexos}
                            className="px-4 py-2 bg-red-700 text-white rounded-xl hover:bg-red-800 transition cursor-pointer"
                            disabled={loading}
                          >
                            Borrar todos los anexos
                          </button>
                        )}
                      </div>
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
                          Cancelar
                        </button>
                      </div>
                    )}
                  </>
                )}

                {/* Botones finales */}
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={handleClose}
                    className="px-5 py-2 border rounded-xl hover:bg-gray-100 transition cursor-pointer"
                    disabled={loading}
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={submitBudgetLogic}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition cursor-pointer disabled:opacity-60"
                    disabled={loading}
                  >
                    {loading ? "Procesando…" : "Guardar cambios"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
