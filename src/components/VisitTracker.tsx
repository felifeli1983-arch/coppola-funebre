'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Fires a single, cookie-less analytics beacon per page view.
 * Rendered in the public layout; never tracks /admin.
 */
export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    const params = new URLSearchParams(window.location.search);
    const payload = {
      path: pathname,
      referrer: document.referrer || null,
      utm: {
        source: params.get('utm_source') ?? undefined,
        medium: params.get('utm_medium') ?? undefined,
        campaign: params.get('utm_campaign') ?? undefined,
      },
    };
    const body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/api/track', { method: 'POST', body, headers: { 'Content-Type': 'application/json' }, keepalive: true });
      }
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
