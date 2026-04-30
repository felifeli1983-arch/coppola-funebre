'use client';

import { Phone } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Reveal, { RevealWords } from './motion/Reveal';
import MagneticButton from './motion/MagneticButton';

const steps = [
  {
    n: '01',
    title: 'Chiamaci, a qualsiasi ora',
    text: 'Rispondiamo 24 ore su 24, 365 giorni l\'anno. Ci occuperemo di tutto, a partire da quel momento.',
  },
  {
    n: '02',
    title: 'Raccogliamo le informazioni',
    text: 'Un nostro consulente si recherà presso di voi per raccogliere i dettagli necessari con discrezione.',
  },
  {
    n: '03',
    title: 'Gestiamo ogni pratica',
    text: 'Denuncia di morte, certificati, necrologi, manifesti: ogni adempimento burocratico è a nostro carico.',
  },
  {
    n: '04',
    title: 'Il giorno del commiato',
    text: 'Vi accompagniamo con la nostra flotta, curando ogni aspetto della cerimonia nel rispetto delle vostre volontà.',
  },
];

export default function CosaFare() {
  const timeline = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: timeline,
    offset: ['start 70%', 'end 70%'],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="cosa-fare" className="py-24 md:py-32 bg-avorio">
      <div className="container-custom">
        <div className="max-w-3xl mb-16">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="divider-line" />
              <span className="eyebrow">Cosa fare in caso di decesso</span>
            </div>
          </Reveal>
          <h2 className="section-title">
            <RevealWords text="Un solo numero," />
            <br />
            <RevealWords text="il resto lo facciamo noi." delay={0.3} wordClassName="italic text-bordeaux" />
          </h2>
        </div>

        <div ref={timeline} className="relative">
          <div className="hidden md:block absolute left-[11px] top-0 bottom-0 w-px bg-pietra/15" />
          <motion.div
            style={{ scaleY, transformOrigin: 'top' }}
            className="hidden md:block absolute left-[11px] top-0 bottom-0 w-px bg-bordeaux"
          />

          <div className="space-y-10 md:space-y-14">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10% 0px' }}
                transition={{ duration: 1, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="relative md:pl-16 grid md:grid-cols-12 gap-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.12 + 0.3 }}
                  className="hidden md:block absolute left-0 top-2 w-6 h-6 rounded-full bg-bordeaux ring-4 ring-avorio"
                />
                <div className="md:col-span-3 font-serif text-4xl md:text-5xl text-oro">
                  {s.n}
                </div>
                <div className="md:col-span-9 max-w-2xl">
                  <h3 className="font-serif text-xl md:text-2xl mb-3">{s.title}</h3>
                  <p className="text-pietra-chiaro font-light leading-relaxed text-base md:text-lg">
                    {s.text}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <Reveal>
          <div className="mt-20 flex flex-col md:flex-row items-center justify-between gap-6 bg-bordeaux text-avorio p-10 md:p-14 relative overflow-hidden">
            <motion.div
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-avorio/10 to-transparent skew-x-12 pointer-events-none"
            />
            <div className="relative">
              <div className="text-xs tracking-widest uppercase text-oro-chiaro mb-2">
                Servizio reperibilità 24h
              </div>
              <div className="font-serif text-2xl md:text-3xl">
                Siamo accanto a voi, subito.
              </div>
            </div>
            <MagneticButton
              href="tel:0815713888"
              className="relative inline-flex items-center gap-3 bg-avorio text-bordeaux px-8 py-4 tracking-wider uppercase text-sm font-medium hover:bg-oro-chiaro transition-colors"
            >
              <Phone size={18} />
              081 571 3888
              <WhatsAppIcon size={18} className="text-oro" />
            </MagneticButton>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
