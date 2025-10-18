import { z } from 'zod';

/**
 * Schema de validación para crear/editar Budget
 */
export const budgetSchema = z.object({
  lead_id: z.string().uuid('Lead ID inválido'),
  title: z.string().min(1, 'El título es requerido'),
  currency: z.enum(['USD', 'ARS', 'EUR']).default('USD'),
  amount_total: z.number().min(0, 'El monto debe ser mayor a 0'),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['draft', 'presentado', 'aceptado', 'rechazado']).default('draft'),
});

export type BudgetFormData = z.infer<typeof budgetSchema>;