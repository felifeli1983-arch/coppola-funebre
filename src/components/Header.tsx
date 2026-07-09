'use client';

import { useEffect, useState } from 'react';
import { Phone, Menu, X, MapPin } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import LanguageSwitcher from './LanguageSwitcher';
import { useT } from '@/i18n/LanguageProvider';
import { withItalyPhonePrefix, phoneTelHref } from '@/i18n/config';

export default function Header() {
  const { t, locale } = useT();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const nav = [
    { href: '#servizi', label: t.header.nav.servizi },
    { href: '#casa-funeraria', label: t.header.nav.casaFuneraria },
    { href: '#cosa-fare', label: t.header.nav.cosaFare },
    { href: '#contatti', label: t.header.nav.contatti },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-avorio/95 backdrop-blur-md shadow-sm border-b border-pietra/5'
          : 'bg-avorio/90 backdrop-blur-sm'
      }`}
    >
      <div className="container-custom flex items-center justify-between py-3">
        <a href="#" className="flex items-center group">
          <img
            src="/img/new/logo-hd.jpg"
            alt="Onoranze Funebri Coppola"
            className="h-12 md:h-14 w-auto transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="relative text-[11px] tracking-widest uppercase font-medium text-pietra hover:text-bordeaux transition-colors group"
            >
              {item.label}
              <span className="absolute left-0 right-0 -bottom-1 h-px bg-bordeaux scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex flex-col items-end leading-tight">
            <a
              href={phoneTelHref(locale)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-bordeaux text-avorio text-xs tracking-widest uppercase font-medium hover:bg-bordeaux-dark transition-colors"
            >
              <Phone size={14} />
              {withItalyPhonePrefix(t.header.phoneCta, locale)}
              <WhatsAppIcon size={14} className="text-oro-chiaro" />
            </a>
            <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] tracking-wider uppercase text-pietra-chiaro">
              <MapPin size={10} strokeWidth={2} className="text-bordeaux" />
              {t.header.coverage}
            </span>
          </div>
          <LanguageSwitcher />
          <button
            onClick={() => setOpen(!open)}
            className="lg:hidden p-2 text-pietra"
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden bg-avorio border-t border-pietra/10">
          <div className="container-custom py-6 flex flex-col gap-4">
            {nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="text-sm tracking-wider uppercase text-pietra py-2 border-b border-pietra/10"
              >
                {item.label}
              </a>
            ))}
            <a
              href={phoneTelHref(locale)}
              className="mt-2 inline-flex items-center justify-center gap-2 px-5 py-3 bg-bordeaux text-avorio text-xs tracking-widest uppercase"
            >
              <Phone size={14} />
              {withItalyPhonePrefix(t.header.callCta, locale)}
              <WhatsAppIcon size={14} className="text-oro-chiaro" />
            </a>
            <div className="text-center text-[10px] tracking-wider uppercase text-pietra-chiaro mt-2">
              {t.header.coverage}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
