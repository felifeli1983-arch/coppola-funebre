'use client';

import { useState, FormEvent } from 'react';
import { Phone, Mail, MessageCircle, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import Reveal, { RevealWords } from './motion/Reveal';

export default function Contatti() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const contacts = [
    { Icon: Phone, label: 'Reperibilità 24h', value: '081 571 3888', href: 'tel:0815713888', primary: true },
    { Icon: MessageCircle, label: 'WhatsApp', value: '+39 349 335 6728', href: 'https://wa.me/393493356728' },
    { Icon: Mail, label: 'Email', value: 'info@impresacoppola.it', href: 'mailto:info@impresacoppola.it' },
  ];

  return (
    <section id="contatti" className="py-24 md:py-32 bg-avorio-scuro">
      <div className="container-custom grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="divider-line" />
              <span className="eyebrow">Contatti</span>
            </div>
          </Reveal>
          <h2 className="section-title mb-8">
            <RevealWords text="Parliamo" />{' '}
            <RevealWords text="con calma." delay={0.2} wordClassName="italic text-bordeaux" />
          </h2>
          <Reveal delay={0.4}>
            <p className="text-lg text-pietra-chiaro font-light leading-relaxed mb-10">
              Per assistenza immediata chiamate il numero 24h. Per informazioni,
              consulenze sulla previdenza o richieste di preventivo potete
              scriverci: vi risponderemo al più presto.
            </p>
          </Reveal>

          <div className="space-y-5">
            {contacts.map((c, i) => (
              <motion.a
                key={c.label}
                href={c.href}
                target={c.href.startsWith('http') ? '_blank' : undefined}
                rel={c.href.startsWith('http') ? 'noopener' : undefined}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-4 group"
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center flex-none transition-colors duration-500 ${
                    c.primary
                      ? 'bg-bordeaux text-avorio group-hover:bg-bordeaux-dark'
                      : 'border border-pietra/20 text-pietra group-hover:border-bordeaux group-hover:text-bordeaux'
                  }`}
                >
                  <c.Icon size={18} />
                </div>
                <div>
                  <div className="text-xs tracking-widest uppercase text-pietra-chiaro mb-1">
                    {c.label}
                  </div>
                  <div className="font-serif text-lg md:text-xl text-pietra group-hover:text-bordeaux transition-colors break-all">
                    {c.value}
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </div>

        <div className="md:col-span-7">
          <Reveal delay={0.2}>
            <form onSubmit={handleSubmit} className="bg-avorio p-8 md:p-12 border border-pietra/10 shadow-sm">
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center"
                >
                  <div className="font-serif text-4xl text-bordeaux mb-4">Grazie.</div>
                  <p className="text-pietra-chiaro">
                    Abbiamo ricevuto il vostro messaggio. Vi contatteremo al più presto.
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <label className="block">
                      <span className="text-xs tracking-widest uppercase text-pietra-chiaro">
                        Nome e cognome
                      </span>
                      <input
                        required
                        type="text"
                        className="mt-2 w-full bg-transparent border-b border-pietra/20 py-3 focus:border-bordeaux outline-none font-serif text-lg transition-colors"
                      />
                    </label>
                    <label className="block">
                      <span className="text-xs tracking-widest uppercase text-pietra-chiaro">
                        Telefono
                      </span>
                      <input
                        required
                        type="tel"
                        className="mt-2 w-full bg-transparent border-b border-pietra/20 py-3 focus:border-bordeaux outline-none font-serif text-lg transition-colors"
                      />
                    </label>
                  </div>
                  <label className="block mt-5">
                    <span className="text-xs tracking-widest uppercase text-pietra-chiaro">
                      Email
                    </span>
                    <input
                      required
                      type="email"
                      className="mt-2 w-full bg-transparent border-b border-pietra/20 py-3 focus:border-bordeaux outline-none font-serif text-lg transition-colors"
                    />
                  </label>
                  <label className="block mt-5">
                    <span className="text-xs tracking-widest uppercase text-pietra-chiaro">
                      Oggetto
                    </span>
                    <select
                      className="mt-2 w-full bg-transparent border-b border-pietra/20 py-3 focus:border-bordeaux outline-none font-serif text-lg transition-colors"
                      defaultValue=""
                    >
                      <option value="" disabled>Scegli un oggetto</option>
                      <option>Richiesta informazioni</option>
                      <option>Previdenza funebre</option>
                      <option>Casa funeraria</option>
                      <option>Condoglianze</option>
                      <option>Altro</option>
                    </select>
                  </label>
                  <label className="block mt-5">
                    <span className="text-xs tracking-widest uppercase text-pietra-chiaro">
                      Messaggio
                    </span>
                    <textarea
                      rows={4}
                      className="mt-2 w-full bg-transparent border-b border-pietra/20 py-3 focus:border-bordeaux outline-none font-serif text-lg resize-none transition-colors"
                    />
                  </label>

                  <label className="flex items-start gap-3 mt-6 text-xs text-pietra-chiaro">
                    <input type="checkbox" required className="mt-1 accent-bordeaux" />
                    <span>
                      Ho letto e accetto l&apos;informativa sulla privacy ai sensi del
                      GDPR Reg. UE 2016/679.
                    </span>
                  </label>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="btn-primary mt-8 group"
                  >
                    Invia messaggio
                    <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </motion.button>
                </>
              )}
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
