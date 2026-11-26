'use client';

import { Phone, MapPin, Mail } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { useT } from '@/i18n/LanguageProvider';
import { phoneDisplay, phoneTelHref } from '@/i18n/config';

export default function Footer() {
  const { t, locale } = useT();
  return (
    <footer className="bg-pietra text-avorio/80 pt-20 pb-8">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-10 pb-16 border-b border-avorio/10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <img src="/img/new/logo-coppola.webp" alt="Onoranze Funebri Coppola" className="h-20 w-auto" />
              <div>
                <div className="font-serif text-xl text-avorio leading-tight">
                  Onoranze Funebri
                  <br />
                  Coppola
                </div>
              </div>
            </div>
            <p className="text-sm md:text-base text-avorio/85 leading-relaxed max-w-md font-light mb-6">
              {t.footer.tagline}
            </p>

            <div className="flex items-start gap-3 text-sm text-avorio/85">
              <MapPin size={16} strokeWidth={1.5} className="text-oro flex-none mt-0.5" />
              <div>
                <div className="font-medium text-avorio">{t.footer.sedeLabel}</div>
                <div className="text-avorio/75 leading-snug">
                  {t.footer.sedeAddress}
                  <br />
                  {t.footer.sedeCity}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs tracking-widest uppercase text-oro mb-4 font-medium">
              {t.footer.navTitle}
            </div>
            <ul className="grid grid-cols-2 gap-x-6 text-sm md:grid-cols-1 md:gap-x-0">
              <li><a href="/" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors md:min-h-8">{t.footer.nav.home}</a></li>
              <li><a href="/negozio" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors md:min-h-8">{t.footer.nav.negozio}</a></li>
              <li><a href="/#servizi" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors md:min-h-8">{t.footer.nav.servizi}</a></li>
              <li><a href="/#casa-funeraria" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors md:min-h-8">{t.footer.nav.casaFuneraria}</a></li>
              <li><a href="/#previdenza" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors md:min-h-8">{t.footer.nav.previdenza}</a></li>
              <li><a href="/#faq" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors md:min-h-8">{t.footer.nav.faq}</a></li>
              <li><a href="/#contatti" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors md:min-h-8">{t.footer.nav.contatti}</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="text-xs tracking-widest uppercase text-oro mb-4 font-medium">
              {t.footer.contattiTitle}
            </div>
            <ul className="space-y-1 text-sm">
              <li>
                <a href={phoneTelHref(locale)} className="flex min-h-12 items-center gap-3 hover:text-avorio transition-colors group">
                  <Phone size={14} strokeWidth={1.5} className="flex-none text-oro" />
                  <span>
                    <span className="block text-[11px] tracking-widest uppercase text-avorio/55">24h</span>
                    <span className="font-medium text-avorio inline-flex items-center gap-1.5">
                      {phoneDisplay(locale)}
                      <WhatsAppIcon size={12} className="text-oro" />
                    </span>
                  </span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/390815713888" target="_blank" rel="noopener" className="flex min-h-12 items-center gap-3 hover:text-avorio transition-colors">
                  <WhatsAppIcon size={14} className="flex-none text-oro" />
                  <span>
                    <span className="block text-[11px] tracking-widest uppercase text-avorio/55">WhatsApp</span>
                    <span className="font-medium text-avorio">{phoneDisplay(locale)}</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="mailto:info@eredicoppola.com" className="flex min-h-12 min-w-0 items-center gap-3 hover:text-avorio transition-colors">
                  <Mail size={14} strokeWidth={1.5} className="flex-none text-oro" />
                  <span>
                    <span className="block text-[11px] tracking-widest uppercase text-avorio/55">Email</span>
                    <span className="font-medium text-avorio break-all">info@eredicoppola.com</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4 text-xs text-avorio/55 text-center md:text-left">
          <div>
            © {new Date().getFullYear()} {t.footer.copyright}
          </div>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 md:justify-end">
            <a href="/privacy-policy" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors">{t.footer.privacy}</a>
            <a href="/cookie-policy" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors">{t.footer.cookie}</a>
            <a href="/codice-etico" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors">{t.footer.codiceEtico}</a>
            <a href="/documenti" className="inline-flex min-h-10 items-center hover:text-avorio transition-colors">{t.footer.documenti}</a>
            <button
              type="button"
              onClick={() => {
                try { localStorage.removeItem('coppola-cookie-consent'); } catch {}
                window.location.reload();
              }}
              className="inline-flex min-h-10 items-center hover:text-avorio transition-colors cursor-pointer"
            >
              {t.footer.manageCookies}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
