import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY no está configurado');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Emails predefinidos para el CRM
 */
export const emailConfig = {
  from: 'CRM Whapy <crm@whapy.com>', // Cambia esto por tu dominio verificado en Resend
  defaultReplyTo: 'hola@whapy.com',
} as const;

/**
 * Helper para enviar email de resumen de reunión
 */
export async function sendMeetingSummaryEmail({
  to,
  leadName,
  meetingId,
  portalUrl,
}: {
  to: string;
  leadName: string;
  meetingId: string;
  portalUrl: string;
}) {
  return resend.emails.send({
    from: emailConfig.from,
    to,
    subject: 'Tu resumen de reunión – Whapy',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${leadName},</h2>
        <p>Dejamos disponible el resumen de lo conversado en nuestra reunión.</p>
        <p>Podés verlo ingresando a tu portal:</p>
        <a href="${portalUrl}/portal/meeting/${meetingId}" 
           style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Ver resumen
        </a>
        <p>Gracias por tu tiempo.</p>
        <p><strong>– Equipo Whapy</strong></p>
      </div>
    `,
  });
}

/**
 * Helper para enviar email de presupuesto listo
 */
export async function sendBudgetReadyEmail({
  to,
  leadName,
  budgetId,
  portalUrl,
}: {
  to: string;
  leadName: string;
  budgetId: string;
  portalUrl: string;
}) {
  return resend.emails.send({
    from: emailConfig.from,
    to,
    subject: 'Tu presupuesto está listo – Whapy',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${leadName},</h2>
        <p>Ya podés revisar el presupuesto de tu proyecto.</p>
        <p>Entrá al portal para verlo:</p>
        <a href="${portalUrl}/portal/budget/${budgetId}" 
           style="display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Ver presupuesto
        </a>
        <p>Si querés avanzar, respondé este mail o presioná "Quiero avanzar" en el portal.</p>
        <p><strong>– Equipo Whapy</strong></p>
      </div>
    `,
  });
}