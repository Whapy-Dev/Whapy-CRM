import { z } from 'zod';

/**
 * Schema de validación para crear/editar Meeting
 */
export const meetingSchema = z.object({
  lead_id: z.string().uuid('Lead ID inválido'),
  start_at: z.string().min(1, 'La fecha es requerida'),
  location: z.string().optional().or(z.literal('')),
  meet_url: z.string().url('URL inválida').optional().or(z.literal('')),
  summary_md: z.string().optional().or(z.literal('')),
});

export type MeetingFormData = z.infer<typeof meetingSchema>;