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
export function ModalAgregarIngreso({ onClose, refetchIngresos }: Props) {
  const { user } = useAuth();
  const { data: dataClientProject = [], isLoading } = useClientProject();

  const [monto, setMonto] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [project, setProject] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
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

  async function agregarEgreso() {
    const supabase = createClient();

    // ✅ validación nueva que pediste: solo descripción y monto > 0
    if (!descripcion.trim() || monto <= 0) {
      console.warn("Falta descripción o monto inválido");
      return;
    }

    try {
      const { error } = await supabase.from("Ingresos").insert({
        project_id: project || null, // si está vacío, se guarda null ✅
        Ingreso: monto,
        Descripcion: descripcion,
        created_at: new Date(argentinaNow).toISOString(),
      });

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
        <h2 className="text-xl font-semibold mb-4">Agregar Egreso</h2>

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
            disabled={!descripcion.trim() || monto <= 0} // 👈 ya no depende del select ✅
            className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400 cursor-pointer"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}
