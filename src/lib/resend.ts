import 'server-only';
import { Resend } from 'resend';

let _resend: Resend | null = null;

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** Lazily-created Resend client. Throws a clear error if not configured. */
export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('Resend not configured (RESEND_API_KEY missing)');
  if (!_resend) _resend = new Resend(key);
  return _resend;
}

export const ORDER_FROM_EMAIL =
  process.env.ORDER_FROM_EMAIL || 'ordini@eredicoppola.com';
export const ORDER_NOTIFY_EMAIL =
  process.env.ORDER_NOTIFY_EMAIL || 'info@eredicoppola.com';
