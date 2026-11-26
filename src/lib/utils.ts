import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind class names, resolving conflicts (shadcn/ui convention). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Initials for avatars: "Mario Rossi" → "MR", "info@x.it" → "IN". */
export function initials(name?: string | null, fallback?: string | null): string {
  const src = (name || fallback || '?').trim();
  const parts = src.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

const dateFmt = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTimeFmt = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(d?: string | Date | null): string {
  if (!d) return '—';
  return dateFmt.format(typeof d === 'string' ? new Date(d) : d);
}

export function formatDateTime(d?: string | Date | null): string {
  if (!d) return '—';
  return dateTimeFmt.format(typeof d === 'string' ? new Date(d) : d);
}

const rtf = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' });

/** "3 giorni fa", "tra 2 ore", "ieri"… */
export function timeAgo(d?: string | Date | null): string {
  if (!d) return '—';
  const date = typeof d === 'string' ? new Date(d) : d;
  const diff = (date.getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return 'adesso';
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 86400 * 30) return rtf.format(Math.round(diff / 86400), 'day');
  if (abs < 86400 * 365) return rtf.format(Math.round(diff / (86400 * 30)), 'month');
  return rtf.format(Math.round(diff / (86400 * 365)), 'year');
}
