'use client';

import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Reveal, { RevealImage, RevealWords } from './motion/Reveal';

const benefici = [
  'Prezzi bloccati al momento della sottoscrizione',
  'Libertà di scegliere ogni dettaglio in serenità',
  'Sollevare i propri cari da ogni preoccupazione economica',
  'Contratto trasparente, senza vincoli nascosti',
];

export default function Previdenza() {
  return (
    <section id="previdenza" className="py-24 md:py-32 bg-avorio">
      <div className="container-custom grid md:grid-cols-12 gap-10 md:gap-16 items-center">
        <div className="md:col-span-5 order-2 md:order-1">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="divider-line" />
              <span className="eyebrow">Previdenza funebre</span>
            </div>
          </Reveal>

          <h2 className="section-title mb-8">
            <RevealWords text="Pianificare oggi," />
            <br />
            <RevealWords text="per un domani sereno." delay={0.3} wordClassName="italic text-bordeaux" />
          </h2>

          <Reveal delay={0.4}>
            <p className="text-lg text-pietra-chiaro font-light leading-relaxed mb-8">
              Con il nostro Contratto di Previdenza Funebre scegli con lucidità
              ogni aspetto del servizio, bloccando i prezzi e proteggendo le persone
              che ami da decisioni difficili nel momento del dolore.
            </p>
          </Reveal>

          <ul className="space-y-3 mb-10">
            {benefici.map((b, i) => (
              <motion.li
                key={b}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start gap-3"
              >
                <Check size={18} className="text-oro flex-none mt-1" strokeWidth={2} />
                <span className="text-pietra">{b}</span>
              </motion.li>
            ))}
          </ul>

          <Reveal delay={0.8}>
            <a href="#contatti" className="btn-primary group">
              Richiedi informazioni
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
          </Reveal>
        </div>

        <div className="md:col-span-7 order-1 md:order-2">
          <RevealImage
            src="/img/locandina-previdenza.jpg"
            alt="Contratto di Previdenza Onoranze Funebre Coppola"
            className="w-full shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
