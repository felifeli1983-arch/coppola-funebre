'use client';

import { useRef } from 'react';
import { MapPin, ChevronLeft, ChevronRight, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import Reveal, { RevealWords } from './motion/Reveal';

const sedi = [
  { nome: 'Mugnano di Napoli', indirizzo: 'Via Pietro Nenni, 10', cap: '80018', principale: true },
  { nome: 'Mugnano di Napoli', indirizzo: 'Via Napoli, 14', cap: '80018' },
  { nome: 'Giugliano in Campania', indirizzo: 'Corso Campano, 74', cap: '80014' },
  { nome: 'Villaricca', indirizzo: 'Via Giacinto Gigante, 124', cap: '80010' },
  { nome: 'Qualiano', indirizzo: 'Via F.lli Rosselli, 26/B', cap: '80019' },
  { nome: 'Melito di Napoli', indirizzo: 'Via Roma, 255', cap: '80017' },
  { nome: 'Lago Patria', indirizzo: 'Via Lago Patria, 55', cap: '80014' },
  { nome: 'Licola Mare', indirizzo: 'Via San Nullo, 165', cap: '80014' },
];

export default function Sedi() {
  const scroller = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'l' | 'r') => {
    if (!scroller.current) return;
    const w = scroller.current.clientWidth * 0.8;
    scroller.current.scrollBy({ left: dir === 'r' ? w : -w, behavior: 'smooth' });
  };

  return (
    <section id="sedi" className="py-20 md:py-28 bg-avorio overflow-hidden">
      <div className="container-custom mb-10 md:mb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="divider-line" />
                <span className="eyebrow">Le nostre sedi</span>
              </div>
            </Reveal>
            <h2 className="section-title">
              <RevealWords text="Otto uffici sul territorio," />
              <br />
              <RevealWords text="sempre vicini a voi." delay={0.3} wordClassName="italic text-bordeaux" />
            </h2>
          </div>
          <Reveal delay={0.3}>
            <div className="flex items-center gap-3">
              <span className="text-[10px] tracking-widest uppercase text-pietra-chiaro hidden md:inline">
                Scorri
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll('l')}
                  className="w-12 h-12 border border-pietra/20 flex items-center justify-center hover:bg-bordeaux hover:text-avorio hover:border-bordeaux transition-all duration-500"
                  aria-label="Precedente"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => scroll('r')}
                  className="w-12 h-12 border border-pietra/20 flex items-center justify-center hover:bg-bordeaux hover:text-avorio hover:border-bordeaux transition-all duration-500"
                  aria-label="Successivo"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth px-5 md:px-8 lg:px-12 pb-4 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none' }}
      >
        {sedi.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-5% 0px' }}
            transition={{ duration: 0.8, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className={`flex-none w-[78%] sm:w-[48%] md:w-[32%] lg:w-[24%] snap-start group relative p-7 border transition-all duration-500 overflow-hidden ${
              s.principale
                ? 'bg-bordeaux text-avorio border-bordeaux'
                : 'bg-avorio border-pietra/15 hover:border-bordeaux'
            }`}
          >
            {!s.principale && (
              <div className="absolute bottom-0 left-0 right-0 h-px bg-bordeaux scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left" />
            )}

            <div className="flex items-start justify-between mb-5">
              <MapPin
                size={20}
                strokeWidth={1.5}
                className={`${s.principale ? 'text-oro-chiaro' : 'text-bordeaux'} group-hover:-rotate-12 transition-transform duration-500`}
              />
              <span
                className={`text-[10px] tracking-widest uppercase ${
                  s.principale ? 'text-oro-chiaro' : 'text-pietra-chiaro'
                }`}
              >
                {s.principale ? 'Sede principale' : `0${i + 1} / 0${sedi.length}`}
              </span>
            </div>
            <h3
              className={`font-serif text-xl md:text-2xl mb-2 ${
                s.principale ? 'text-avorio' : 'text-pietra'
              }`}
            >
              {s.nome}
            </h3>
            <p
              className={`text-sm leading-relaxed mb-5 ${
                s.principale ? 'text-avorio/80' : 'text-pietra-chiaro'
              }`}
            >
              {s.indirizzo}
              <br />
              {s.cap} · Napoli
            </p>

            <a
              href="tel:0815713888"
              className={`inline-flex items-center gap-2 text-[11px] tracking-widest uppercase font-medium transition-colors ${
                s.principale
                  ? 'text-avorio hover:text-oro-chiaro'
                  : 'text-bordeaux hover:text-bordeaux-dark'
              }`}
            >
              <Phone size={12} />
              Chiama
            </a>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
