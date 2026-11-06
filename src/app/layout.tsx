import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { headers } from 'next/headers';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';
import Analytics from '@/components/Analytics';
import StructuredData from '@/components/StructuredData';
import { LanguageProvider } from '@/i18n/LanguageProvider';
import {
  LOCALES,
  LOCALE_MAP,
  DEFAULT_LOCALE,
  LANG_HEADER,
  isLocale,
} from '@/i18n/config';

// NOTE: hreflang alternates are declared in sitemap.ts (Google-recommended and
// query-string-safe). We intentionally do NOT use metadata.alternates.languages
// here because Next 14 strips the ?lang= query from those URLs, which would emit
// incorrect root-pointing hreflang tags conflicting with the sitemap.
const alternateLocales = LOCALES.filter((l) => l.code !== DEFAULT_LOCALE).map((l) =>
  l.hreflang.includes('-') ? l.hreflang.replace('-', '_') : l.hreflang,
);

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.eredicoppola.com'),
  title: 'Onoranze Funebri Coppola',
  description:
    'Onoranze Funebri Coppola: casa funeraria, servizi funebri 24h, previdenza funebre. Operiamo in tutta Italia.',
  keywords: [
    'onoranze funebri',
    'Onoranze Funebri Coppola',
    'casa funeraria',
    'sala del commiato',
    'servizi funebri',
    'previdenza funebre',
    'arte sacra',
    'trigesimi',
  ],
  openGraph: {
    title: 'Onoranze Funebri Coppola',
    description: 'Un servizio esclusivo alla portata di tutti. 24h su 24, 365 giorni l\'anno. Operiamo in tutta Italia.',
    type: 'website',
    locale: 'it_IT',
    alternateLocale: alternateLocales,
    url: 'https://www.eredicoppola.com',
    siteName: 'Onoranze Funebri Coppola',
    images: [
      {
        url: '/img/new/cancello-sede.webp',
        width: 1448,
        height: 1086,
        alt: 'Onoranze Funebri Coppola — Sede Mugnano di Napoli',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onoranze Funebri Coppola',
    description: 'Casa funeraria, servizi funebri 24h, previdenza funebre. Operiamo in tutta Italia.',
    images: ['/img/new/cancello-sede.webp'],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // The middleware sets this header from a ?lang= URL so the page is server-
  // rendered in the pinned language (correct HTML per hreflang URL). Bare "/"
  // has no header → stays the Italian canonical; the client auto-switches by geo.
  const headerLang = headers().get(LANG_HEADER);
  const initialLocale = isLocale(headerLang) ? headerLang : DEFAULT_LOCALE;
  const meta = LOCALE_MAP[initialLocale];

  return (
    <html
      lang={meta.hreflang}
      dir={meta.dir}
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable}`}
    >
      <body>
        <LanguageProvider initialLocale={initialLocale}>
          <StructuredData />
          <Analytics />
          {children}
          <CookieBanner />
        </LanguageProvider>
      </body>
    </html>
  );
}
