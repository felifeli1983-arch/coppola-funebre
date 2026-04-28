'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Reveal, { RevealWords } from './motion/Reveal';

const auto = [
  { src: '/img/new/auto-maserati.jpg', label: 'Maserati Ghibli', sub: 'Allestimento esclusivo Coppola' },
  { src: '/img/new/auto-chrysler.jpg', label: 'Chrysler 300', sub: 'Linea premium argento' },
  { src: '/img/new/auto-06.jpg', label: 'Serie Tradizionale', sub: 'Eleganza classica' },
  { src: '/img/new/auto-07.jpg', label: 'Serie Cerimonia', sub: 'Allestimento sobrio' },
  { src: '/img/new/auto-12.jpg', label: 'Serie Lunga', sub: 'Vetture per cortei' },
];

export default function Flotta() {
  const scroller = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ['start end', 'end start'] });
  const headX = useTransform(scrollYProgress, [0, 1], ['-8%', '4%']);

  const scroll = (dir: 'l' | 'r') => {
    if (!scroller.current) return;
    const w = scroller.current.clientWidth * 0.8;
    scroller.current.scrollBy({ left: dir === 'r' ? w : -w, behavior: 'smooth' });
  };

  return (
    <section ref={section} className="py-24 md:py-32 bg-avorio overflow-hidden">
      <motion.div
        style={{ x: headX }}
        className="pointer-events-none absolute left-0 right-0 text-[20vw] font-serif italic text-pietra/[0.035] leading-none whitespace-nowrap select-none hidden md:block gpu"
      >
        flotta · flotta · flotta
      </motion.div>

      <div className="container-custom mb-12 md:mb-16 relative">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="max-w-2xl">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="divider-line" />
                <span className="eyebrow">La flotta</span>
              </div>
            </Reveal>
            <h2 className="section-title">
              <RevealWords text="Una flotta" />{' '}
              <RevealWords text="di prestigio." delay={0.3} wordClassName="italic text-bordeaux" />
            </h2>
            <Reveal delay={0.5}>
              <p className="mt-6 text-lg text-pietra-chiaro font-light leading-relaxed">
                Vetture mantenute con cura maniacale, guidate da personale formato al
                massimo rigore. Dall&apos;esclusiva autofunebre Maserati alla gamma
                tradizionale.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.3}>
            <div className="flex gap-2">
              <button
                onClick={() => scroll('l')}
                className="w-14 h-14 border border-pietra/20 flex items-center justify-center hover:bg-bordeaux hover:text-avorio hover:border-bordeaux transition-all duration-500"
                aria-label="Precedente"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => scroll('r')}
                className="w-14 h-14 border border-pietra/20 flex items-center justify-center hover:bg-bordeaux hover:text-avorio hover:border-bordeaux transition-all duration-500"
                aria-label="Successivo"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </Reveal>
        </div>
      </div>

      <motion.div
        ref={scroller}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth px-5 md:px-8 lg:px-12 pb-4 cursor-grab active:cursor-grabbing"
        style={{ scrollbarWidth: 'none' }}
      >
        {auto.map((a, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="flex-none w-[85%] sm:w-[55%] md:w-[42%] lg:w-[32%] snap-start group"
          >
            <div className="aspect-[4/3] overflow-hidden relative">
              <img
                src={a.src}
                alt={a.label}
                className="w-full h-full object-cover photo-warm group-hover:scale-110 transition-transform duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-pietra/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute bottom-4 left-4 right-4 text-avorio translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
                <div className="text-[10px] tracking-widest uppercase text-oro-chiaro">
                  {a.sub}
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="font-serif text-xl">{a.label}</span>
              <span className="text-xs tracking-widest uppercase text-oro">
                {String(i + 1).padStart(2, '0')} / {String(auto.length).padStart(2, '0')}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
