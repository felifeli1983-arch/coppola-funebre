'use client';

import {
  Home,
  Car,
  Flower2,
  FileText,
  Plane,
  HeartHandshake,
} from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Reveal, { RevealWords } from './motion/Reveal';
import { useT } from '@/i18n/LanguageProvider';

const SERVIZI_ICONS = [Home, Car, Flower2, FileText, Plane, HeartHandshake];

type ServizioCard = { icon: (typeof SERVIZI_ICONS)[number]; title: string; text: string };

function Card({ s, i }: { s: ServizioCard; i: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const Icon = s.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.9, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative bg-avorio p-8 md:p-10 overflow-hidden cursor-default"
    >
      <div className="absolute inset-0 bg-bordeaux origin-bottom scale-y-0 group-hover:scale-y-100 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]" />
      <div className="absolute top-0 left-0 right-0 h-px bg-oro scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out origin-left" />

      <div className="relative z-10">
        <Icon
          size={36}
          strokeWidth={1.2}
          className="text-bordeaux mb-6 group-hover:text-oro-chiaro transition-colors duration-500"
        />
        <h3 className="font-serif text-xl md:text-2xl mb-3 group-hover:text-avorio transition-colors duration-500">
          {s.title}
        </h3>
        <p className="text-pietra-chiaro font-light leading-relaxed group-hover:text-avorio/80 transition-colors duration-500">
          {s.text}
        </p>
      </div>
    </motion.div>
  );
}

export default function Servizi() {
  const { t } = useT();
  const servizi: ServizioCard[] = t.servizi.items.map((item, idx) => ({
    icon: SERVIZI_ICONS[idx],
    title: item.title,
    text: item.text,
  }));

  return (
    <section id="servizi" className="py-24 md:py-32 bg-avorio">
      <div className="container-custom">
        <div className="max-w-3xl mb-16 md:mb-20">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="divider-line" />
              <span className="eyebrow">{t.servizi.eyebrow}</span>
            </div>
          </Reveal>
          <h2 className="section-title">
            <RevealWords text={t.servizi.title1} />
            <br />
            <RevealWords text={t.servizi.title2} delay={0.3} wordClassName="italic text-bordeaux" />
          </h2>
          <Reveal delay={0.5}>
            <p className="mt-6 text-lg text-pietra-chiaro font-light leading-relaxed">
              {t.servizi.intro}
            </p>
          </Reveal>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-pietra/10">
          {servizi.map((s, i) => <Card key={i} s={s} i={i} />)}
        </div>
      </div>
    </section>
  );
}
