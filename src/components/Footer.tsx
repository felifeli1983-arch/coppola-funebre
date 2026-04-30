'use client';

import { Phone, MapPin, Mail } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';

export default function Footer() {
  return (
    <footer className="bg-pietra text-avorio/80 pt-20 pb-8">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-10 pb-16 border-b border-avorio/10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <img src="/img/new/logo-hd.jpg" alt="Onoranze Funebri Coppola" className="h-20 w-auto" />
              <div>
                <div className="font-serif text-xl text-avorio leading-tight">
                  Onoranze Funebri
                  <br />
                  Coppola
                </div>
              </div>
            </div>
            <p className="text-sm md:text-base text-avorio/85 leading-relaxed max-w-md font-light mb-6">
              Un servizio esclusivo alla portata di tutti. Operiamo su tutto il
              territorio nazionale, con rispetto e discrezione.
            </p>

            <div className="flex items-start gap-3 text-sm text-avorio/85">
              <MapPin size={16} strokeWidth={1.5} className="text-oro flex-none mt-0.5" />
              <div>
                <div className="font-medium text-avorio">Sede centrale</div>
                <div className="text-avorio/75 leading-snug">
                  Via Pietro Nenni 10 (Circumvallazione Esterna)
                  <br />
                  80018 Mugnano di Napoli
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs tracking-widest uppercase text-oro mb-4 font-medium">
              Navigazione
            </div>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-avorio transition-colors">Home</a></li>
              <li><a href="/#servizi" className="hover:text-avorio transition-colors">Servizi</a></li>
              <li><a href="/#casa-funeraria" className="hover:text-avorio transition-colors">Sala del Commiato</a></li>
              <li><a href="/#previdenza" className="hover:text-avorio transition-colors">Previdenza</a></li>
              <li><a href="/#faq" className="hover:text-avorio transition-colors">FAQ</a></li>
              <li><a href="/#contatti" className="hover:text-avorio transition-colors">Contatti</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="text-xs tracking-widest uppercase text-oro mb-4 font-medium">
              Contatti
            </div>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:0815713888" className="flex items-center gap-3 hover:text-avorio transition-colors group">
                  <Phone size={14} strokeWidth={1.5} className="flex-none text-oro" />
                  <span>
                    <span className="block text-[10px] tracking-widest uppercase text-avorio/50">24h</span>
                    <span className="font-medium text-avorio">081 571 3888</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/390815713888" target="_blank" rel="noopener" className="flex items-center gap-3 hover:text-avorio transition-colors">
                  <WhatsAppIcon size={14} className="flex-none text-[#25D366]" />
                  <span>
                    <span className="block text-[10px] tracking-widest uppercase text-avorio/50">WhatsApp</span>
                    <span className="font-medium text-avorio">081 571 3888</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="https://wa.me/393509306272" target="_blank" rel="noopener" className="flex items-center gap-3 hover:text-avorio transition-colors">
                  <WhatsAppIcon size={14} className="flex-none text-[#25D366]" />
                  <span>
                    <span className="block text-[10px] tracking-widest uppercase text-avorio/50">Arte Sacra · Trigesimi</span>
                    <span className="font-medium text-avorio">350 930 6272</span>
                  </span>
                </a>
              </li>
              <li>
                <a href="mailto:info@eredicoppola.com" className="flex items-center gap-3 hover:text-avorio transition-colors">
                  <Mail size={14} strokeWidth={1.5} className="flex-none text-oro" />
                  <span>
                    <span className="block text-[10px] tracking-widest uppercase text-avorio/50">Email</span>
                    <span className="font-medium text-avorio">info@eredicoppola.com</span>
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-avorio/50">
          <div>
            © {new Date().getFullYear()} Onoranze Funebri Coppola · Tutti i diritti riservati
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="/privacy-policy" className="hover:text-avorio transition-colors">Privacy Policy</a>
            <a href="/cookie-policy" className="hover:text-avorio transition-colors">Cookie Policy</a>
            <a href="/codice-etico" className="hover:text-avorio transition-colors">Codice Etico</a>
            <button
              type="button"
              onClick={() => {
                try { localStorage.removeItem('coppola-cookie-consent'); } catch {}
                window.location.reload();
              }}
              className="hover:text-avorio transition-colors cursor-pointer"
            >
              Gestisci cookie
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
