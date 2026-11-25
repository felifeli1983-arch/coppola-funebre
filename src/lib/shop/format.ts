/** Format a price given in integer cents as a localized currency string. */
export function formatPrice(cents: number, currency = 'EUR', locale = 'it-IT'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
    (cents ?? 0) / 100,
  );
}

/** Parse a user-typed euro amount ("12,50" or "12.50") into integer cents. */
export function parsePriceToCents(input: string): number {
  const normalized = String(input).trim().replace(/\./g, '').replace(',', '.');
  const value = Number(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

/** Build a public image URL from a Supabase Storage path (bucket: prodotti). */
export function productImageUrl(storagePath: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !storagePath) return '';
  if (storagePath.startsWith('http')) return storagePath;
  return `${base}/storage/v1/object/public/prodotti/${storagePath}`;
}
