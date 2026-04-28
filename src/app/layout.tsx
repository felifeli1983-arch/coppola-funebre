import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

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
    'Oltre un secolo accanto alle famiglie. Impresa Funebre Coppola: casa funeraria, servizi funebri 24h, previdenza funebre. 8 sedi in provincia di Napoli.',
  keywords: [
    'onoranze funebri Napoli',
    'impresa funebre Coppola',
    'casa funeraria Mugnano',
    'servizi funebri Giugliano',
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
      <body>{children}</body>
    </html>
  );
}
