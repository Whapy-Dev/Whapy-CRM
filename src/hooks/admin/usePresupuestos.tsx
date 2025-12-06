// hooks/usePresupuestos.ts
import { useState, useEffect } from "react";
import {
  Admin,
  Anexo,
  Cuota,
  Document,
  EstadoFase,
  Fase,
  i18nPlural,
} from "@/app/crm/usuarios/components/components/types";
import { Project } from "@/utils/types";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "../useAuth";

interface UseBudgetDataReturn {
  anexos: Anexo[];
  setAnexos: React.Dispatch<React.SetStateAction<Anexo[]>>;
  fases: Fase[];
  setFases: React.Dispatch<React.SetStateAction<Fase[]>>;
  admins: Admin[];
  documents: Document[];
  loadingData: boolean;
  refetchAnexos: () => Promise<void>;
  refetchFases: () => Promise<void>;
}

export function useBudgetData(
  selectedProject: Project | null
): UseBudgetDataReturn {
  const supabase = createClient();

  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [admins, setAdmins] = useState<{ id: string; nombre: string }[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingData, setLoadingData] = useState(false);

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

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!selectedProject) {
        setDocuments([]);
        return;
      }

      const { data, error } = await supabase
        .from("documents")
        .select("id, title, document_url, project_id, category_document")
        .eq("project_id", selectedProject.id)
        .eq("category_document", "Presupuestos");

      if (error || !data) {
        setDocuments([]);
        return;
      }

      setDocuments(data ?? []);
    };

    fetchDocuments();
  }, [selectedProject?.id]);

  const refetchAnexos = async () => {
    const presupuestoId = selectedProject?.presupuesto?.id;
    if (!presupuestoId) {
      setAnexos([]);
      return;
    }

    const { data } = await supabase
      .from("anexos")
      .select("*")
      .eq("presupuesto_id", presupuestoId);

    setAnexos(data ?? []);
  };

  const refetchFases = async () => {
    const presupuestoId = selectedProject?.presupuesto?.id;
    if (!presupuestoId) {
      setFases([]);
      return;
    }

    setLoadingData(true);

    const { data: fasesData } = await supabase
      .from("fases")
      .select("*")
      .eq("presupuesto_id", presupuestoId)
      .order("orden", { ascending: true });

    if (!fasesData) {
      setFases([]);
      setLoadingData(false);
      return;
    }

    const fasesConCuotas = await Promise.all(
      fasesData.map(async (fase) => {
        const { data: cuotasData } = await supabase
          .from("pago_cuotas")
          .select("*")
          .eq("fase_id", fase.id)
          .order("cuota", { ascending: true });

        return {
          ...fase,
          cuotas: cuotasData ?? [],
        };
      })
    );

    setFases(fasesConCuotas);
    setLoadingData(false);
  };

  useEffect(() => {
    if (selectedProject?.presupuesto) {
      refetchAnexos();
      refetchFases();
    } else {
      setAnexos([]);
      setFases([]);
    }
  }, [selectedProject?.presupuesto?.id]);

  return {
    anexos,
    setAnexos,
    fases,
    setFases,
    admins,
    documents,
    loadingData,
    refetchAnexos,
    refetchFases,
  };
}

// ============ FASES HOOK ============

interface UseFasesReturn {
  loading: boolean;
  crearFase: (
    presupuestoId: string,
    nombre: string,
    monto: number,
    orden: number,
    fechaVencimiento?: string,
    projectName?: string
  ) => Promise<Fase | null>;
  actualizarFase: (
    faseId: string,
    updates: Partial<Fase>,
    projectName?: string,
    faseNombre?: string
  ) => Promise<boolean>;
  eliminarFase: (
    faseId: string,
    projectName?: string,
    faseNombre?: string,
    faseMonto?: number
  ) => Promise<boolean>;
  actualizarEstadoFase: (
    faseId: string,
    estado: EstadoFase,
    projectName?: string,
    faseNombre?: string
  ) => Promise<boolean>;
  reordenarFases: (fases: { id: string; orden: number }[]) => Promise<boolean>;
}

export function useFases(): UseFasesReturn {
  const supabase = createClient();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Helper para registrar actividad
  const registrarActividad = async (
    accion: string,
    projectName: string,
    detalles: string
  ) => {
    try {
      const { error } = await supabase.from("historial_actividad").insert([
        {
          usuario_modificador_id: user?.id,
          accion,
          usuario_modificado: projectName,
          seccion: "Presupuestos",
          detalles,
        },
      ]);
      if (error) {
        console.error("Error al registrar actividad:", error);
      }
    } catch (err) {
      console.error("Error al registrar actividad:", err);
    }
  };

  const crearFase = async (
    presupuestoId: string,
    nombre: string,
    monto: number,
    orden: number,
    fechaVencimiento?: string,
    projectName?: string
  ): Promise<Fase | null> => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("fases")
        .insert([
          {
            presupuesto_id: presupuestoId,
            nombre,
            monto,
            orden,
            estado: "Pendiente",
            fecha_vencimiento: fechaVencimiento || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Registrar actividad
      if (projectName) {
        const fechaStr = fechaVencimiento
          ? ` - Vence: ${new Date(fechaVencimiento).toLocaleDateString(
              "es-AR"
            )}`
          : "";
        await registrarActividad(
          "Creó una fase",
          projectName,
          `Fase "${nombre}" por $${monto.toFixed(2)}${fechaStr}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error creando fase:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const actualizarFase = async (
    faseId: string,
    updates: Partial<Fase>,
    projectName?: string,
    faseNombre?: string
  ): Promise<boolean> => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("fases")
        .update(updates)
        .eq("id", faseId);

      if (error) throw error;

      // Registrar actividad
      if (projectName) {
        const cambios: string[] = [];
        if (updates.nombre) cambios.push(`nombre: "${updates.nombre}"`);
        if (updates.monto !== undefined)
          cambios.push(`monto: $${updates.monto.toFixed(2)}`);
        if (updates.estado) cambios.push(`estado: ${updates.estado}`);
        if (updates.fecha_vencimiento !== undefined) {
          const fechaStr = updates.fecha_vencimiento
            ? new Date(updates.fecha_vencimiento).toLocaleDateString("es-AR")
            : "sin fecha";
          cambios.push(`vencimiento: ${fechaStr}`);
        }

        await registrarActividad(
          "Actualizó una fase",
          projectName,
          `Fase "${faseNombre || updates.nombre || ""}": ${cambios.join(", ")}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error actualizando fase:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarFase = async (
    faseId: string,
    projectName?: string,
    faseNombre?: string,
    faseMonto?: number
  ): Promise<boolean> => {
    setLoading(true);

    try {
      // 1. Primero eliminar ingresos relacionados con las cuotas de esta fase
      const { data: cuotas } = await supabase
        .from("pago_cuotas")
        .select("id")
        .eq("fase_id", faseId);

      if (cuotas && cuotas.length > 0) {
        const cuotaIds = cuotas.map((c) => c.id);
        await supabase.from("Ingresos").delete().in("pago_cuotas_id", cuotaIds);
      }

      // 2. Eliminar cuotas
      await supabase.from("pago_cuotas").delete().eq("fase_id", faseId);

      // 3. Eliminar fase
      const { error } = await supabase.from("fases").delete().eq("id", faseId);

      if (error) throw error;

      // Registrar actividad
      if (projectName) {
        const montoStr = faseMonto ? ` - $${faseMonto.toFixed(2)}` : "";
        const cuotasStr = cuotas?.length ? ` (${cuotas.length} cuotas)` : "";
        await registrarActividad(
          "Eliminó una fase",
          projectName,
          `Fase "${faseNombre || ""}"${montoStr}${cuotasStr}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error eliminando fase:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstadoFase = async (
    faseId: string,
    estado: EstadoFase,
    projectName?: string,
    faseNombre?: string
  ): Promise<boolean> => {
    const result = await actualizarFase(
      faseId,
      { estado },
      projectName,
      faseNombre
    );
    return result;
  };

  const reordenarFases = async (
    fases: { id: string; orden: number }[]
  ): Promise<boolean> => {
    setLoading(true);

    try {
      for (const fase of fases) {
        await supabase
          .from("fases")
          .update({ orden: fase.orden })
          .eq("id", fase.id);
      }
      return true;
    } catch (error) {
      console.error("Error reordenando fases:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    crearFase,
    actualizarFase,
    eliminarFase,
    actualizarEstadoFase,
    reordenarFases,
  };
}

// ============ CUOTAS HOOK ============

interface CrearCuotaParams {
  faseId: string;
  presupuestoId: string;
  monto: number;
  divisa: string;
  vencimiento: string;
  numeroCuota: number;
  totalCuotas: number;
  projectName?: string;
}

interface UseCuotasReturn {
  loading: boolean;
  crearCuotas: (
    faseId: string,
    presupuestoId: string,
    montos: number[],
    divisa: string,
    fechasVencimiento: string[],
    projectName?: string
  ) => Promise<Cuota[]>;
  crearCuotaIndividual: (params: CrearCuotaParams) => Promise<Cuota | null>;
  actualizarCuota: (
    cuotaId: string,
    updates: Partial<Cuota>,
    projectName?: string,
    numeroCuota?: number
  ) => Promise<boolean>;
  eliminarCuota: (
    cuotaId: string,
    projectName?: string,
    numeroCuota?: number,
    monto?: number
  ) => Promise<boolean>;
  eliminarCuotasDeFase: (
    faseId: string,
    projectName?: string
  ) => Promise<boolean>;
  marcarComoPagada: (
    cuotaId: string,
    projectName: string,
    facturaUrl?: string | null
  ) => Promise<boolean>;
  obtenerCuotasDeFase: (faseId: string) => Promise<Cuota[]>;
  uploadFactura: (file: File) => Promise<string | null>;
}

export function useCuotas(): UseCuotasReturn {
  const supabase = createClient();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Helper para registrar actividad
  const registrarActividad = async (
    accion: string,
    projectName: string,
    detalles: string
  ) => {
    try {
      const { error } = await supabase.from("historial_actividad").insert([
        {
          usuario_modificador_id: user?.id,
          accion,
          usuario_modificado: projectName,
          seccion: "Presupuestos",
          detalles,
        },
      ]);
      if (error) {
        console.error("Error al registrar actividad:", error);
      }
    } catch (err) {
      console.error("Error al registrar actividad:", err);
    }
  };

  // Subir factura a storage
  const uploadFactura = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `cuotas/${fileName}`;

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
  };

  const crearCuotas = async (
    faseId: string,
    presupuestoId: string,
    montos: number[],
    divisa: string,
    fechasVencimiento: string[],
    projectName?: string
  ): Promise<Cuota[]> => {
    setLoading(true);

    try {
      // Obtener el número de cuotas existentes para continuar la numeración
      const { data: cuotasExistentes } = await supabase
        .from("pago_cuotas")
        .select("cuota")
        .eq("fase_id", faseId)
        .order("cuota", { ascending: false })
        .limit(1);

      const ultimaCuota = cuotasExistentes?.[0]?.cuota || 0;
      const totalCuotas = montos.length;

      const cuotasToInsert = montos.map((monto, i) => ({
        fase_id: faseId,
        presupuesto_id: presupuestoId,
        monto,
        cuota: ultimaCuota + i + 1,
        detalle: i18nPlural(ultimaCuota + i + 1, ultimaCuota + totalCuotas),
        estado: "Pendiente de pago",
        divisa,
        vencimiento: fechasVencimiento[i],
        created_at: new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("pago_cuotas")
        .insert(cuotasToInsert)
        .select();

      if (error) throw error;

      // Registrar actividad
      if (projectName) {
        const totalMonto = montos.reduce((a, b) => a + b, 0);
        await registrarActividad(
          "Creó cuotas",
          projectName,
          `${montos.length} cuotas por un total de $${totalMonto.toFixed(2)}`
        );
      }

      return data ?? [];
    } catch (error) {
      console.error("Error creando cuotas:", error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const crearCuotaIndividual = async (
    params: CrearCuotaParams
  ): Promise<Cuota | null> => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("pago_cuotas")
        .insert([
          {
            fase_id: params.faseId,
            presupuesto_id: params.presupuestoId,
            monto: params.monto,
            cuota: params.numeroCuota,
            detalle: i18nPlural(params.numeroCuota, params.totalCuotas),
            estado: "Pendiente de pago",
            divisa: params.divisa,
            vencimiento: params.vencimiento,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Registrar actividad
      if (params.projectName) {
        await registrarActividad(
          "Creó una cuota",
          params.projectName,
          `Cuota #${params.numeroCuota} por $${params.monto.toFixed(
            2
          )} - Vence: ${new Date(params.vencimiento).toLocaleDateString(
            "es-AR"
          )}`
        );
      }

      return data;
    } catch (error) {
      console.error("Error creando cuota:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const actualizarCuota = async (
    cuotaId: string,
    updates: Partial<Cuota>,
    projectName?: string,
    numeroCuota?: number
  ): Promise<boolean> => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("pago_cuotas")
        .update(updates)
        .eq("id", cuotaId);

      if (error) throw error;

      // Registrar actividad
      if (projectName) {
        const cambios: string[] = [];
        if (updates.monto !== undefined)
          cambios.push(`monto: $${updates.monto.toFixed(2)}`);
        if (updates.estado) cambios.push(`estado: ${updates.estado}`);
        if (updates.vencimiento) {
          cambios.push(
            `vencimiento: ${new Date(updates.vencimiento).toLocaleDateString(
              "es-AR"
            )}`
          );
        }

        await registrarActividad(
          "Actualizó una cuota",
          projectName,
          `Cuota ${numeroCuota ? `#${numeroCuota}` : ""}: ${cambios.join(", ")}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error actualizando cuota:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarCuota = async (
    cuotaId: string,
    projectName?: string,
    numeroCuota?: number,
    monto?: number
  ): Promise<boolean> => {
    setLoading(true);

    try {
      // 1. PRIMERO eliminar de Ingresos (por la FK)
      await supabase.from("Ingresos").delete().eq("pago_cuotas_id", cuotaId);

      // 2. Luego eliminar la cuota
      const { error } = await supabase
        .from("pago_cuotas")
        .delete()
        .eq("id", cuotaId);

      if (error) throw error;

      // Registrar actividad
      if (projectName) {
        const montoStr = monto ? ` - $${monto.toFixed(2)}` : "";
        await registrarActividad(
          "Eliminó una cuota",
          projectName,
          `Cuota ${numeroCuota ? `#${numeroCuota}` : ""}${montoStr}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error eliminando cuota:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const eliminarCuotasDeFase = async (
    faseId: string,
    projectName?: string
  ): Promise<boolean> => {
    setLoading(true);

    try {
      // 1. Obtener IDs de cuotas de esta fase
      const { data: cuotas } = await supabase
        .from("pago_cuotas")
        .select("id")
        .eq("fase_id", faseId);

      if (cuotas && cuotas.length > 0) {
        const cuotaIds = cuotas.map((c) => c.id);

        // 2. PRIMERO eliminar de Ingresos
        await supabase.from("Ingresos").delete().in("pago_cuotas_id", cuotaIds);
      }

      // 3. Luego eliminar las cuotas
      const { error } = await supabase
        .from("pago_cuotas")
        .delete()
        .eq("fase_id", faseId);

      if (error) throw error;

      // Registrar actividad
      if (projectName && cuotas) {
        await registrarActividad(
          "Eliminó cuotas de fase",
          projectName,
          `${cuotas.length} cuotas eliminadas`
        );
      }

      return true;
    } catch (error) {
      console.error("Error eliminando cuotas de fase:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const marcarComoPagada = async (
    cuotaId: string,
    projectName: string,
    facturaUrl?: string | null
  ): Promise<boolean> => {
    setLoading(true);

    try {
      // 1. Obtener datos de la cuota
      const { data: cuota, error: errorCuota } = await supabase
        .from("pago_cuotas")
        .select("*")
        .eq("id", cuotaId)
        .single();

      if (errorCuota || !cuota) throw errorCuota;

      // 2. Actualizar estado y factura en pago_cuotas
      const { error: errorUpdate } = await supabase
        .from("pago_cuotas")
        .update({
          estado: "Pagada",
          factura_url: facturaUrl || null,
        })
        .eq("id", cuotaId);

      if (errorUpdate) throw errorUpdate;

      // 3. Registrar ingreso con factura
      const { error: errorIngreso } = await supabase.from("Ingresos").insert([
        {
          nombre: `Proyecto: ${projectName}`,
          categoria: "Proyectos",
          presupuesto_id: cuota.presupuesto_id,
          pago_cuotas_id: cuotaId,
          Ingreso: cuota.monto,
          Descripcion: `Cuota ${cuota.detalle}`,
          divisa: cuota.divisa,
          factura_url: facturaUrl || null,
        },
      ]);

      if (errorIngreso) throw errorIngreso;

      // 4. Registrar actividad
      const facturaStr = facturaUrl ? " (con factura)" : "";
      await registrarActividad(
        "Registró pago de cuota",
        projectName,
        `Cuota ${cuota.detalle} - $${cuota.monto.toFixed(2)}${facturaStr}`
      );

      return true;
    } catch (error) {
      console.error("Error marcando cuota como pagada:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const obtenerCuotasDeFase = async (faseId: string): Promise<Cuota[]> => {
    try {
      const { data, error } = await supabase
        .from("pago_cuotas")
        .select("*")
        .eq("fase_id", faseId)
        .order("cuota", { ascending: true });

      if (error) throw error;
      return data ?? [];
    } catch (error) {
      console.error("Error obteniendo cuotas:", error);
      return [];
    }
  };

  return {
    loading,
    crearCuotas,
    crearCuotaIndividual,
    actualizarCuota,
    eliminarCuota,
    eliminarCuotasDeFase,
    marcarComoPagada,
    obtenerCuotasDeFase,
    uploadFactura,
  };
}

// ============ PRESUPUESTO HOOK ============

interface UsePresupuestoReturn {
  loading: boolean;
  actualizarMonto: (
    presupuestoId: string,
    nuevoMonto: number,
    projectName?: string
  ) => Promise<boolean>;
}

export function usePresupuesto(): UsePresupuestoReturn {
  const supabase = createClient();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Helper para registrar actividad
  const registrarActividad = async (
    accion: string,
    projectName: string,
    detalles: string
  ) => {
    try {
      const { error } = await supabase.from("historial_actividad").insert([
        {
          usuario_modificador_id: user?.id,
          accion,
          usuario_modificado: projectName,
          seccion: "Presupuestos",
          detalles,
        },
      ]);
      if (error) {
        console.error("Error al registrar actividad:", error);
      }
    } catch (err) {
      console.error("Error al registrar actividad:", err);
    }
  };

  const actualizarMonto = async (
    presupuestoId: string,
    nuevoMonto: number,
    projectName?: string
  ): Promise<boolean> => {
    setLoading(true);

    try {
      const { error } = await supabase
        .from("presupuestos")
        .update({ monto: nuevoMonto })
        .eq("id", presupuestoId);

      if (error) throw error;

      // Registrar actividad
      if (projectName) {
        await registrarActividad(
          "Actualizó monto de presupuesto",
          projectName,
          `Nuevo monto: $${nuevoMonto.toFixed(2)}`
        );
      }

      return true;
    } catch (error) {
      console.error("Error actualizando monto:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    actualizarMonto,
  };
}
