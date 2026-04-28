import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';

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
  title: 'Impresa Funebre Coppola — Onoranze Funebri a Napoli',
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
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="it" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
