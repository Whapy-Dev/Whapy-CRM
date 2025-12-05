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

  const [categoria, setCategoria] = useState("");
  const [subCategoria, setSubCategoria] = useState("");
  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [userId, setUserId] = useState("");
  const [userNombre, setUserNombre] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Pre-cargar datos cuando se está editando
  useEffect(() => {
    if (egresoToEdit) {
      setCategoria(egresoToEdit.categoria || "");
      setSubCategoria(egresoToEdit.subcategoria || "");
      setMonto(egresoToEdit.Egreso || 0);
      setDescripcion(egresoToEdit.Descripcion || "");
      if (egresoToEdit.user_id) {
        setUserId(egresoToEdit.user_id);
      }
      if (egresoToEdit.profiles?.nombre) {
        setUserNombre(egresoToEdit.profiles.nombre);
      }
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

  async function handleSubmit() {
    const supabase = createClient();
    if (!categoria || !subCategoria || monto <= 0) return;

    try {
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
          created_at: new Date(argentinaNow).toISOString(),
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
      await refetchEgresos();
      onClose();
    } catch (error) {
      console.error("Error al guardar egreso:", error);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200">
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
            disabled={!categoria || !subCategoria || monto <= 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400 cursor-pointer"
          >
            {isEditing ? "Guardar" : "Agregar"}
          </button>
        </div>
      </div>
    </div>
  );
}
