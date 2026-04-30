import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';
import Analytics from '@/components/Analytics';
import StructuredData from '@/components/StructuredData';

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
    url: 'https://www.eredicoppola.com',
    siteName: 'Onoranze Funebri Coppola',
    images: [
      {
        url: '/img/new/sede-esterno.jpg',
        width: 1800,
        height: 1013,
        alt: 'Onoranze Funebri Coppola — Sede Mugnano di Napoli',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Onoranze Funebri Coppola',
    description: 'Casa funeraria, servizi funebri 24h, previdenza funebre. Operiamo in tutta Italia.',
    images: ['/img/new/sede-esterno.jpg'],
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
  return (
    <html lang="it" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <StructuredData />
        <Analytics />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
