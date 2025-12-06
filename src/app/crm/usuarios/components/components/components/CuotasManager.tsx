// components/CuotasManager.tsx
"use client";

import { useState, useRef } from "react";
import {
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
  Upload,
  X,
  FileText,
  Eye,
} from "lucide-react";
import { Fase, Cuota, formatCurrency, i18nPlural } from "../types";
import { useCuotas } from "@/hooks/admin/usePresupuestos";

interface CuotasManagerProps {
  fase: Fase;
  divisa: string;
  presupuestoId: string;
  projectName: string;
  onRefresh: () => Promise<void>;
}

const estadoCuotaConfig = {
  Pagada: {
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-50 border-green-200",
  },
  "Pendiente de pago": {
    icon: Clock,
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
  },
  Vencida: {
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
};

export default function CuotasManager({
  fase,
  divisa,
  presupuestoId,
  projectName,
  onRefresh,
}: CuotasManagerProps) {
  const {
    crearCuotas,
    crearCuotaIndividual,
    marcarComoPagada,
    eliminarCuota,
    eliminarCuotasDeFase,
    actualizarCuota,
    uploadFactura,
    loading,
  } = useCuotas();

  // Estados para crear cuotas
  const [showCrear, setShowCrear] = useState(false);
  const [cantidadCuotas, setCantidadCuotas] = useState(1);
  const [montosPersonalizados, setMontosPersonalizados] = useState(false);
  const [montos, setMontos] = useState<number[]>([fase.monto]);
  const [fechasVencimiento, setFechasVencimiento] = useState<string[]>([
    new Date().toISOString().split("T")[0],
  ]);

  // Estados para modal de pago
  const [showPagarModal, setShowPagarModal] = useState(false);
  const [cuotaAPagar, setCuotaAPagar] = useState<Cuota | null>(null);
  const [facturaFile, setFacturaFile] = useState<File | null>(null);
  const [uploadingFactura, setUploadingFactura] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para editar cuota
  const [editingCuota, setEditingCuota] = useState<string | null>(null);
  const [editMonto, setEditMonto] = useState(0);
  const [editVencimiento, setEditVencimiento] = useState("");

  // Estados para agregar cuota individual
  const [showAgregarUna, setShowAgregarUna] = useState(false);
  const [nuevaCuotaMonto, setNuevaCuotaMonto] = useState(0);
  const [nuevaCuotaVencimiento, setNuevaCuotaVencimiento] = useState(
    new Date().toISOString().split("T")[0]
  );

  const cuotas = fase.cuotas || [];
  const tieneCuotas = cuotas.length > 0;
  const montoPorPagar = cuotas
    .filter((c) => c.estado !== "Pagada")
    .reduce((sum, c) => sum + c.monto, 0);
  const montoAsignadoCuotas = cuotas.reduce((sum, c) => sum + c.monto, 0);
  const montoDisponibleParaCuotas = fase.monto - montoAsignadoCuotas;

  // ========== HANDLERS CREAR CUOTAS ==========

  const handleCantidadChange = (n: number) => {
    if (n < 1) return;
    setCantidadCuotas(n);

    // Ajustar array de fechas
    const nuevasFechas = [...fechasVencimiento];
    while (nuevasFechas.length < n) {
      const ultimaFecha = nuevasFechas[nuevasFechas.length - 1];
      const nextDate = new Date(ultimaFecha);
      nextDate.setDate(nextDate.getDate() + 30);
      nuevasFechas.push(nextDate.toISOString().split("T")[0]);
    }
    while (nuevasFechas.length > n) {
      nuevasFechas.pop();
    }
    setFechasVencimiento(nuevasFechas);

    // Ajustar montos
    if (!montosPersonalizados) {
      const montoDisponible =
        fase.monto - cuotas.reduce((sum, c) => sum + c.monto, 0);
      const montoPorCuota = montoDisponible / n;
      setMontos(Array(n).fill(montoPorCuota));
    } else {
      const nuevosMontos = [...montos];
      while (nuevosMontos.length < n) {
        nuevosMontos.push(0);
      }
      while (nuevosMontos.length > n) {
        nuevosMontos.pop();
      }
      setMontos(nuevosMontos);
    }
  };

  const handleMontoChange = (index: number, value: number) => {
    const nuevosMontos = [...montos];
    nuevosMontos[index] = value;
    setMontos(nuevosMontos);
  };

  const handleFechaChange = (index: number, value: string) => {
    const nuevasFechas = [...fechasVencimiento];
    nuevasFechas[index] = value;
    setFechasVencimiento(nuevasFechas);
  };

  const sumaMontos = montos.reduce((a, b) => a + b, 0);
  const montosValidos = sumaMontos <= montoDisponibleParaCuotas;

  const handleCrearCuotas = async () => {
    if (!montosValidos) {
      alert("La suma de las cuotas no puede superar el monto disponible");
      return;
    }

    // Convertir fechas a ISO
    const fechasISO = fechasVencimiento.map((f) =>
      new Date(f + "T12:00:00").toISOString()
    );

    await crearCuotas(fase.id, presupuestoId, montos, divisa, fechasISO);
    resetCrearForm();
    await onRefresh();
  };

  const resetCrearForm = () => {
    setShowCrear(false);
    setCantidadCuotas(1);
    setMontosPersonalizados(false);
    const montoDisponible =
      fase.monto - cuotas.reduce((sum, c) => sum + c.monto, 0);
    setMontos([montoDisponible]);
    setFechasVencimiento([new Date().toISOString().split("T")[0]]);
  };

  // ========== HANDLERS AGREGAR CUOTA INDIVIDUAL ==========

  const handleAgregarCuotaIndividual = async () => {
    if (nuevaCuotaMonto <= 0) {
      alert("El monto debe ser mayor a 0");
      return;
    }
    if (nuevaCuotaMonto > montoDisponibleParaCuotas) {
      alert("El monto excede el disponible");
      return;
    }

    const ultimaCuota =
      cuotas.length > 0 ? Math.max(...cuotas.map((c) => c.cuota)) : 0;

    await crearCuotaIndividual({
      faseId: fase.id,
      presupuestoId,
      monto: nuevaCuotaMonto,
      divisa,
      vencimiento: new Date(nuevaCuotaVencimiento + "T12:00:00").toISOString(),
      numeroCuota: ultimaCuota + 1,
      totalCuotas: ultimaCuota + 1,
    });

    setShowAgregarUna(false);
    setNuevaCuotaMonto(0);
    setNuevaCuotaVencimiento(new Date().toISOString().split("T")[0]);
    await onRefresh();
  };

  // ========== HANDLERS PAGAR CUOTA ==========

  const handleOpenPagarModal = (cuota: Cuota) => {
    setCuotaAPagar(cuota);
    setShowPagarModal(true);
    setFacturaFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleConfirmarPago = async () => {
    if (!cuotaAPagar) return;

    setUploadingFactura(true);

    try {
      let facturaUrl: string | null = null;

      if (facturaFile) {
        facturaUrl = await uploadFactura(facturaFile);
      }

      await marcarComoPagada(cuotaAPagar.id, projectName, facturaUrl);

      setShowPagarModal(false);
      setCuotaAPagar(null);
      setFacturaFile(null);
      await onRefresh();
    } catch (error) {
      console.error("Error al procesar pago:", error);
    } finally {
      setUploadingFactura(false);
    }
  };

  // ========== HANDLERS EDITAR CUOTA ==========

  const handleStartEdit = (cuota: Cuota) => {
    setEditingCuota(cuota.id);
    setEditMonto(cuota.monto);
    setEditVencimiento(new Date(cuota.vencimiento).toISOString().split("T")[0]);
  };

  const handleSaveEdit = async (cuotaId: string) => {
    await actualizarCuota(cuotaId, {
      monto: editMonto,
      vencimiento: new Date(editVencimiento + "T12:00:00").toISOString(),
    });
    setEditingCuota(null);
    await onRefresh();
  };

  const handleCancelEdit = () => {
    setEditingCuota(null);
    setEditMonto(0);
    setEditVencimiento("");
  };

  // ========== HANDLERS ELIMINAR ==========

  const handleEliminarCuota = async (cuotaId: string) => {
    const confirm = window.confirm("¿Eliminar esta cuota?");
    if (!confirm) return;

    await eliminarCuota(cuotaId);
    await onRefresh();
  };

  const handleEliminarTodasCuotas = async () => {
    const confirm = window.confirm("¿Eliminar TODAS las cuotas de esta fase?");
    if (!confirm) return;

    await eliminarCuotasDeFase(fase.id);
    await onRefresh();
  };

  // ========== HELPERS ==========

  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4 ">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h6 className="font-medium text-gray-700">
            Cuotas de la fase
            {tieneCuotas && (
              <span className="ml-2 text-sm text-gray-500">
                ({cuotas.length} cuota{cuotas.length > 1 ? "s" : ""})
              </span>
            )}
          </h6>
          {montoDisponibleParaCuotas > 0 && (
            <p className="text-xs text-gray-500">
              Disponible: {formatCurrency(montoDisponibleParaCuotas, divisa)}
            </p>
          )}
        </div>

        {tieneCuotas && (
          <button
            onClick={handleEliminarTodasCuotas}
            className="text-sm text-red-600 hover:text-red-700"
            disabled={loading}
          >
            Eliminar todas
          </button>
        )}
      </div>

      {/* Lista de cuotas existentes */}
      {tieneCuotas && (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {cuotas.map((cuota) => {
            const config =
              estadoCuotaConfig[
                cuota.estado as keyof typeof estadoCuotaConfig
              ] || estadoCuotaConfig["Pendiente de pago"];
            const Icon = config.icon;
            const isEditing = editingCuota === cuota.id;

            return (
              <div
                key={cuota.id}
                className={`p-3 rounded-lg border ${config.bg}`}
              >
                {isEditing ? (
                  // Modo edición
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-600">Monto</label>
                        <input
                          type="number"
                          value={editMonto}
                          onChange={(e) => setEditMonto(Number(e.target.value))}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">
                          Vencimiento
                        </label>
                        <input
                          type="date"
                          value={editVencimiento}
                          onChange={(e) => setEditVencimiento(e.target.value)}
                          className="w-full border rounded px-2 py-1 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveEdit(cuota.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        disabled={loading}
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  // Modo visualización
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon size={18} className={config.color} />
                      <div>
                        <p className="font-medium">
                          Cuota {cuota.cuota}:{" "}
                          {formatCurrency(cuota.monto, divisa)}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          Vence: {formatFecha(cuota.vencimiento)}
                        </p>
                        {cuota.factura_url && (
                          <a
                            href={cuota.factura_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                          >
                            <FileText size={12} /> Ver factura
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${config.color}`}>
                        {cuota.estado}
                      </span>

                      {cuota.estado !== "Pagada" && (
                        <>
                          <button
                            onClick={() => handleStartEdit(cuota)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                            title="Editar"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleOpenPagarModal(cuota)}
                            className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition"
                            disabled={loading}
                          >
                            Pagar
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleEliminarCuota(cuota.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                        disabled={loading}
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Resumen */}
          {montoPorPagar > 0 && (
            <div className="text-right text-sm text-gray-600 pt-2">
              Por pagar:{" "}
              <strong>{formatCurrency(montoPorPagar, divisa)}</strong>
            </div>
          )}
        </div>
      )}

      {/* Botones para agregar cuotas */}
      {montoDisponibleParaCuotas > 0 && !showCrear && !showAgregarUna && (
        <div className="flex gap-2">
          <button
            onClick={() => {
              const montoDisp = montoDisponibleParaCuotas;
              setMontos([montoDisp]);
              setShowCrear(true);
            }}
            className="flex-1 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            Agregar varias cuotas
          </button>
          <button
            onClick={() => setShowAgregarUna(true)}
            className="px-4 py-3 border-2 border-dashed border-green-300 rounded-lg text-green-600 hover:border-green-400 hover:bg-green-50 transition flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            +1 cuota
          </button>
        </div>
      )}

      {/* Formulario agregar UNA cuota */}
      {showAgregarUna && (
        <div className="bg-white p-4 rounded-lg border space-y-4">
          <h6 className="font-medium">Agregar cuota individual</h6>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Monto</label>
              <input
                type="number"
                value={nuevaCuotaMonto || ""}
                onChange={(e) => setNuevaCuotaMonto(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                max={montoDisponibleParaCuotas}
              />
              <p className="text-xs text-gray-400 mt-1">
                Máx: {formatCurrency(montoDisponibleParaCuotas, divisa)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Fecha vencimiento</label>
              <input
                type="date"
                value={nuevaCuotaVencimiento}
                onChange={(e) => setNuevaCuotaVencimiento(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAgregarUna(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleAgregarCuotaIndividual}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              disabled={loading || nuevaCuotaMonto <= 0}
            >
              Agregar
            </button>
          </div>
        </div>
      )}

      {/* Formulario crear VARIAS cuotas */}
      {showCrear && (
        <div className="bg-white p-4 rounded-lg border space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                Cantidad de cuotas
              </label>
              <input
                type="number"
                min={1}
                value={cantidadCuotas}
                onChange={(e) => handleCantidadChange(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 mt-1"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={montosPersonalizados}
                  onChange={(e) => {
                    setMontosPersonalizados(e.target.checked);
                    if (!e.target.checked) {
                      const montoPorCuota =
                        montoDisponibleParaCuotas / cantidadCuotas;
                      setMontos(Array(cantidadCuotas).fill(montoPorCuota));
                    }
                  }}
                />
                Montos personalizados
              </label>
            </div>
          </div>

          {/* Montos y fechas por cuota */}
          <div className="grid grid-cols-2 gap-3">
            {montos.map((monto, i) => (
              <div key={i} className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-600">
                    Cuota {i + 1} - Monto
                  </label>
                  <input
                    type="number"
                    value={montosPersonalizados ? monto : monto.toFixed(2)}
                    onChange={(e) =>
                      handleMontoChange(i, Number(e.target.value))
                    }
                    disabled={!montosPersonalizados}
                    className="w-full border rounded px-2 py-1 text-sm disabled:bg-gray-100"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-600">Vencimiento</label>
                  <input
                    type="date"
                    value={fechasVencimiento[i]}
                    onChange={(e) => handleFechaChange(i, e.target.value)}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Validación */}
          <div
            className={`text-sm ${
              montosValidos ? "text-green-600" : "text-red-600"
            }`}
          >
            Suma: {formatCurrency(sumaMontos, divisa)} / Disponible:{" "}
            {formatCurrency(montoDisponibleParaCuotas, divisa)}
            {!montosValidos && " ⚠️ Excede el monto disponible"}
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <button
              onClick={resetCrearForm}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrearCuotas}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || !montosValidos}
            >
              {loading ? "Creando…" : "Crear cuotas"}
            </button>
          </div>
        </div>
      )}

      {/* Si no hay monto disponible */}
      {montoDisponibleParaCuotas <= 0 && !showCrear && !showAgregarUna && (
        <div className="text-center py-4 text-gray-500 text-sm bg-gray-50 rounded-lg">
          Todo el monto de la fase está asignado a cuotas
        </div>
      )}

      {/* Modal de pago con factura */}
      {showPagarModal && cuotaAPagar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold">Confirmar pago</h4>
              <button
                onClick={() => {
                  setShowPagarModal(false);
                  setCuotaAPagar(null);
                  setFacturaFile(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Info de la cuota */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Cuota a pagar:</p>
                <p className="text-xl font-bold">
                  {formatCurrency(cuotaAPagar.monto, divisa)}
                </p>
                <p className="text-sm text-gray-500">
                  Cuota {cuotaAPagar.cuota} - {cuotaAPagar.detalle}
                </p>
              </div>

              {/* Upload factura */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Adjuntar factura (opcional)
                </label>
                <p className="text-xs text-gray-500 mb-2">
                  PDF, PNG, JPG o WEBP - máx 10MB
                </p>

                {facturaFile ? (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText size={20} className="text-blue-600" />
                      <span className="text-sm truncate max-w-[200px]">
                        {facturaFile.name}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        setFacturaFile(null);
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition text-center"
                  >
                    <Upload size={24} className="mx-auto text-gray-400 mb-2" />
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
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowPagarModal(false);
                  setCuotaAPagar(null);
                  setFacturaFile(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                disabled={uploadingFactura}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarPago}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={uploadingFactura}
              >
                {uploadingFactura ? "Procesando…" : "Confirmar pago"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
