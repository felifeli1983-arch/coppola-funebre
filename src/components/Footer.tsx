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
              alle famiglie della provincia di Napoli, con rispetto e discrezione.
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
              <li><a href="#sedi" className="hover:text-avorio transition-colors">Sedi</a></li>
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
                <a href="https://wa.me/393493356728" className="hover:text-avorio transition-colors">
                  WhatsApp · +39 349 335 6728
                </a>
              </li>
              <li>
                <a href="mailto:info@impresacoppola.it" className="hover:text-avorio transition-colors">
                  info@impresacoppola.it
                </a>
              </li>
              <li className="pt-3 text-avorio/60">
                Sede principale<br />
                Via Pietro Nenni, 10 · 80018 Mugnano di Napoli
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-avorio/50">
          <div>
            © {new Date().getFullYear()} Impresa Funebre Coppola · P.IVA 08378311214 ·
            Tutti i diritti riservati
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-avorio transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-avorio transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-avorio transition-colors">Codice Etico</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
