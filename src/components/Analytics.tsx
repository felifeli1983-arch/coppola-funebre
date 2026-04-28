'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'coppola-cookie-consent';

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataLayer: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag: (...args: any[]) => void;
  }
}

export default function Analytics() {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
  const [consent, setConsent] = useState<Consent | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setConsent(JSON.parse(raw) as Consent);
      } catch {}
    };
    read();
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) read();
    };
    const onCustom = () => read();
    window.addEventListener('storage', onStorage);
    window.addEventListener('coppola-consent-updated', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('coppola-consent-updated', onCustom);
    };
  }, []);

  // Update gtag consent state when it changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.gtag || !consent) return;
    window.gtag('consent', 'update', {
      analytics_storage: consent.analytics ? 'granted' : 'denied',
      ad_storage: consent.marketing ? 'granted' : 'denied',
      ad_user_data: consent.marketing ? 'granted' : 'denied',
      ad_personalization: consent.marketing ? 'granted' : 'denied',
    });
  }, [consent]);

  if (!GA_ID) return null;

  return (
    <>
      {/* Consent Mode v2: imposta default DENIED prima di caricare GA */}
      <Script id="gtag-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          gtag('js', new Date());
          gtag('config', '${GA_ID}', { anonymize_ip: true });
        `}
      </Script>
    </>
  );
}
