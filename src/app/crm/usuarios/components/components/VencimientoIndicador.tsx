// VencimientoIndicator.tsx
// Componente para mostrar indicador visual de vencimiento

import React from "react";
import { AlertTriangle, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface VencimientoIndicatorProps {
  fechaVencimiento: string | null | undefined;
  estado?: string; // Para cuotas: "Pagada", "Pendiente", etc.
  className?: string;
  showIcon?: boolean;
}

export const calcularDiasRestantes = (
  fecha: string | null | undefined
): number | null => {
  if (!fecha) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(fecha);
  vencimiento.setHours(0, 0, 0, 0);

  const diffTime = vencimiento.getTime() - hoy.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const getVencimientoInfo = (
  fechaVencimiento: string | null | undefined,
  estado?: string
): {
  texto: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  urgencia:
    | "vencido"
    | "urgente"
    | "proximo"
    | "normal"
    | "pagado"
    | "sin_fecha";
} => {
  // Si ya está pagada, mostrar estado positivo
  if (estado === "Pagada" || estado === "Completada") {
    return {
      texto: "Completado",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/30",
      icon: <CheckCircle className="w-3.5 h-3.5" />,
      urgencia: "pagado",
    };
  }

  const dias = calcularDiasRestantes(fechaVencimiento);

  if (dias === null) {
    return {
      texto: "Sin fecha",
      color: "text-gray-500 dark:text-gray-400",
      bgColor: "bg-gray-50 dark:bg-gray-800",
      icon: <Clock className="w-3.5 h-3.5" />,
      urgencia: "sin_fecha",
    };
  }

  if (dias < 0) {
    const diasVencido = Math.abs(dias);
    return {
      texto:
        diasVencido === 1 ? "Venció ayer" : `Vencido hace ${diasVencido} días`,
      color: "text-red-600 dark:text-red-400",
      bgColor:
        "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      urgencia: "vencido",
    };
  }

  if (dias === 0) {
    return {
      texto: "¡Vence hoy!",
      color: "text-red-600 dark:text-red-400",
      bgColor:
        "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 animate-pulse",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      urgencia: "vencido",
    };
  }

  if (dias === 1) {
    return {
      texto: "Vence mañana",
      color: "text-orange-600 dark:text-orange-400",
      bgColor:
        "bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      urgencia: "urgente",
    };
  }

  if (dias <= 3) {
    return {
      texto: `Vence en ${dias} días`,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-900/30",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      urgencia: "urgente",
    };
  }

  if (dias <= 7) {
    return {
      texto: `Vence en ${dias} días`,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-900/30",
      icon: <Clock className="w-3.5 h-3.5" />,
      urgencia: "proximo",
    };
  }

  if (dias <= 14) {
    return {
      texto: `Vence en ${dias} días`,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
      icon: <Clock className="w-3.5 h-3.5" />,
      urgencia: "normal",
    };
  }

  // Más de 14 días
  const semanas = Math.floor(dias / 7);
  const textoTiempo =
    semanas > 4
      ? `Vence en ${Math.floor(dias / 30)} mes${
          Math.floor(dias / 30) > 1 ? "es" : ""
        }`
      : `Vence en ${semanas} semana${semanas > 1 ? "s" : ""}`;

  return {
    texto: textoTiempo,
    color: "text-gray-600 dark:text-gray-400",
    bgColor: "bg-gray-50 dark:bg-gray-800",
    icon: <Clock className="w-3.5 h-3.5" />,
    urgencia: "normal",
  };
};

export const VencimientoIndicator: React.FC<VencimientoIndicatorProps> = ({
  fechaVencimiento,
  estado,
  className = "",
  showIcon = true,
}) => {
  const info = getVencimientoInfo(fechaVencimiento, estado);

  // No mostrar nada si está pagado y no hay fecha
  if (info.urgencia === "sin_fecha" && !fechaVencimiento) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${info.color} ${info.bgColor} ${className}`}
    >
      {showIcon && info.icon}
      {info.texto}
    </span>
  );
};

// Componente compacto solo para mostrar días
export const VencimientoBadge: React.FC<{
  fechaVencimiento: string | null | undefined;
  estado?: string;
}> = ({ fechaVencimiento, estado }) => {
  const info = getVencimientoInfo(fechaVencimiento, estado);

  if (info.urgencia === "sin_fecha" || info.urgencia === "pagado") {
    return null;
  }

  // Solo mostrar si es urgente o vencido
  if (info.urgencia !== "vencido" && info.urgencia !== "urgente") {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold ${info.color}`}
    >
      {info.icon}
      {info.texto}
    </span>
  );
};

export default VencimientoIndicator;
