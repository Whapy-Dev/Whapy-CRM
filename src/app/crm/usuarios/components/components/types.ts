// types.ts - Tipos compartidos para el sistema de presupuestos

import { Project } from "@/utils/types";

export type EstadoPresupuesto =
  | "Sin presentar"
  | "En revisión"
  | "Rechazado"
  | "Aceptado";

export type EstadoFase = "Pendiente" | "En progreso" | "Completada";

export type EstadoCuota = "Pendiente de pago" | "Pagada" | "Vencida";

export interface Presupuesto {
  id: string;
  monto: number;
  estado: string;
  divisa: string;
  project_id: string;
  document_id?: string | null;
  user_id?: string | null;
  created_at: string;
}

export interface Fase {
  id: string;
  presupuesto_id: string;
  nombre: string;
  descripcion?: string | null;
  monto: number;
  orden: number;
  estado: EstadoFase;
  created_at: string;
  updated_at?: string;
  // Relación virtual para UI
  cuotas?: Cuota[];
  fecha_vencimiento: string | null;
}

export interface Cuota {
  id: string;
  fase_id: string;
  presupuesto_id: string;
  monto: number;
  cuota: number; // número de cuota (1, 2, 3...)
  detalle: string;
  estado: EstadoCuota;
  divisa: string;
  vencimiento: string;
  created_at: string;
  factura_url: string;
}

export interface Anexo {
  id: string;
  monto: number;
  presupuesto_id: string;
}

export interface Document {
  id: string;
  title: string;
  document_url?: string;
  project_id: string;
  category_document?: string;
}

export interface Admin {
  id: string;
  nombre: string;
  rol?: string;
}

// Props compartidas
export interface BudgetModalProps {
  show: boolean;
  projects: Project[];
  clientNombre: string;
  onClose: () => void;
  refetchProfile: () => void;
}

export interface TabProps {
  selectedProject: Project;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  refetchProfile: () => void;
  onClose: () => void;
}

// Helpers
export function formatCurrency(amount: number, divisa: string = "USD"): string {
  const symbol = divisa === "USD" ? "US$" : "$";
  return `${symbol}${amount.toLocaleString("es-AR")}`;
}

export function i18nPlural(cuota: number, total: number): string {
  return `${cuota} de ${total} cuotas`;
}
