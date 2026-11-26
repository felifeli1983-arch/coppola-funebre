'use client';

import { useEffect, useState } from 'react';

export type ShippingConfig = { costo_cent: number; soglia_gratis_cent: number; attiva: boolean };

let cache: ShippingConfig | null = null;
let inflight: Promise<ShippingConfig | null> | null = null;

function load(): Promise<ShippingConfig | null> {
  if (cache) return Promise.resolve(cache);
  if (!inflight) {
    inflight = fetch('/api/negozio/spedizione')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ShippingConfig | null) => {
        cache = d;
        return d;
      })
      .catch(() => null)
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

/** Shipping settings (shared/cached) + cost for a given subtotal. */
export function useShipping(subtotalCent: number) {
  const [sp, setSp] = useState<ShippingConfig | null>(cache);
  useEffect(() => {
    let alive = true;
    load().then((d) => alive && setSp(d));
    return () => {
      alive = false;
    };
  }, []);

  const ready = sp !== null;
  const threshold = sp && sp.attiva ? sp.soglia_gratis_cent : 0;
  const costCent = !sp || !sp.attiva ? 0 : threshold > 0 && subtotalCent >= threshold ? 0 : sp.costo_cent;
  const missingForFree = threshold > 0 ? Math.max(0, threshold - subtotalCent) : 0;
  const progress = threshold > 0 ? Math.min(100, Math.round((subtotalCent / threshold) * 100)) : 0;

  return { ready, costCent, threshold, missingForFree, progress };
}
