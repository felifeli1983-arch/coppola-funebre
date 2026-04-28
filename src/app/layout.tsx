import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';
import Analytics from '@/components/Analytics';

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
  title: 'Impresa Funebre Coppola — Onoranze Funebri',
  description:
    'Oltre un secolo accanto alle famiglie. Impresa Funebre Coppola: casa funeraria, servizi funebri 24h, previdenza funebre.',
  keywords: [
    'onoranze funebri',
    'impresa funebre Coppola',
    'casa funeraria',
    'servizi funebri',
    'previdenza funebre',
  ],
  openGraph: {
    title: 'Impresa Funebre Coppola',
    description: 'Un servizio esclusivo alla portata di tutti. 24h su 24, 365 giorni l\'anno.',
    type: 'website',
    locale: 'it_IT',
    url: 'https://www.eredicoppola.com',
    siteName: 'Impresa Funebre Coppola',
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
        <Analytics />
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
