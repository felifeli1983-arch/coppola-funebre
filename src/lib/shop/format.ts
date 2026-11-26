import { SUPABASE_URL } from '@/lib/supabase/env';

/** Format a price given in integer cents as a localized currency string. */
export function formatPrice(cents: number, currency = 'EUR', locale = 'it-IT'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    (cents ?? 0) / 100,
  );
}

/** Parse a user-typed euro amount ("12,50" or "12.50") into integer cents. */
export function parsePriceToCents(input: string): number {
  let s = String(input ?? '').trim().replace(/[€\s]/g, '');
  if (s.includes(',')) {
    // Italian format: dots are thousands separators, comma is the decimal mark.
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    // "1.250" → thousands separator only.
    s = s.replace(/\./g, '');
  }
  // Otherwise a single dot is the decimal mark ("7.50" → 7,50 €).
  const value = Number(s);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

/** Build a public URL from a Supabase Storage path for a given bucket. */
export function storageUrl(bucket: string, storagePath: string): string {
  const base = SUPABASE_URL;
  if (!base || !storagePath) return '';
  if (storagePath.startsWith('http')) return storagePath;
  return `${base}/storage/v1/object/public/${bucket}/${storagePath}`;
}

/** Build a public image URL from a Supabase Storage path (bucket: prodotti). */
export function productImageUrl(storagePath: string): string {
  return storageUrl('prodotti', storagePath);
}

/** Build a public URL for an uploaded document (bucket: documenti). */
export function documentUrl(storagePath: string): string {
  return storageUrl('documenti', storagePath);
}
