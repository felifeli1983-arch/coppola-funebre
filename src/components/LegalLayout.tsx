'use client';

import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import StickyCTA from './StickyCTA';
import SmoothScroll from './SmoothScroll';

export default function LegalLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <>
      <SmoothScroll />
      <Header />
      <main className="pt-32 md:pt-40 pb-24 md:pb-32 bg-avorio min-h-screen">
        <div className="container-custom max-w-4xl">
          <div className="mb-12 md:mb-16 pb-10 border-b border-pietra/10">
            <div className="flex items-center gap-3 mb-5">
              <span className="divider-line" />
              <span className="eyebrow">Documento legale</span>
            </div>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light leading-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-5 text-lg text-pietra-chiaro font-light">{subtitle}</p>
            )}
          </div>

          <div className="prose-coppola">{children}</div>

          <div className="mt-16 pt-10 border-t border-pietra/10">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm tracking-widest uppercase text-bordeaux hover:text-bordeaux-dark transition-colors"
            >
              ← Torna alla home
            </a>
          </div>
        </div>
      </main>
      <Footer />
      <StickyCTA />
    </>
  );
}
