'use client';

export default function Footer() {
  return (
    <footer className="bg-pietra text-avorio/80 pt-20 pb-8">
      <div className="container-custom">
        <div className="grid md:grid-cols-12 gap-10 pb-16 border-b border-avorio/10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4 mb-6">
              <img src="/img/new/logo-hd.jpg" alt="Coppola" className="h-20 w-auto" />
              <div>
                <div className="font-serif text-xl text-avorio">Impresa Funebre Coppola</div>
                <div className="text-xs tracking-widest uppercase text-oro-chiaro mt-1">
                  Oltre un secolo di servizio
                </div>
              </div>
            </div>
            <p className="font-light leading-relaxed max-w-md">
              Un servizio esclusivo alla portata di tutti. Oltre un secolo accanto
              alle famiglie, con rispetto e discrezione.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="text-xs tracking-widest uppercase text-oro mb-4">
              Navigazione
            </div>
            <ul className="space-y-2 text-sm">
              <li><a href="#storia" className="hover:text-avorio transition-colors">La Storia</a></li>
              <li><a href="#servizi" className="hover:text-avorio transition-colors">Servizi</a></li>
              <li><a href="#casa-funeraria" className="hover:text-avorio transition-colors">Casa Funeraria</a></li>
              <li><a href="#previdenza" className="hover:text-avorio transition-colors">Previdenza</a></li>
              <li><a href="#contatti" className="hover:text-avorio transition-colors">Contatti</a></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="text-xs tracking-widest uppercase text-oro mb-4">
              Contatti
            </div>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="tel:0815713888" className="hover:text-avorio transition-colors">
                  24h · 081 571 3888
                </a>
              </li>
              <li>
                <a href="https://wa.me/390815713888" className="hover:text-avorio transition-colors">
                  WhatsApp · 081 571 3888
                </a>
              </li>
              <li>
                <a href="mailto:info@eredicoppola.com" className="hover:text-avorio transition-colors">
                  info@eredicoppola.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-avorio/50">
          <div>
            © {new Date().getFullYear()} Impresa Funebre Coppola · Tutti i diritti riservati
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
