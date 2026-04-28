'use client';

import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Reveal, { RevealWords } from './motion/Reveal';

const gallery = [
  '/img/new/reception.jpg',
  '/img/new/croce-onice.jpg',
  '/img/new/meeting-room.jpg',
  '/img/new/interno-3.jpg',
  '/img/new/interno-5.jpg',
];

export default function CasaFuneraria() {
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], isMobile ? ['0%', '0%'] : ['-8%', '8%']);

  return (
    <section ref={ref} id="casa-funeraria" className="relative py-24 md:py-32 bg-pietra text-avorio overflow-hidden">
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 opacity-[0.08] pointer-events-none gpu"
      >
        <div className="absolute inset-0 bg-[url('/img/new/dettaglio-1.jpg')] bg-cover bg-center" />
      </motion.div>

      <div className="relative container-custom">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 mb-16">
          <div className="md:col-span-5">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="divider-line bg-oro" />
                <span className="text-xs tracking-widest uppercase text-oro font-medium">
                  La Casa Funeraria
                </span>
              </div>
            </Reveal>
            <h2 className="section-title text-avorio">
              <RevealWords text="Uno spazio di" />
              <br />
              <RevealWords text="raccoglimento." delay={0.3} wordClassName="italic text-oro-chiaro" />
            </h2>
          </div>
          <div className="md:col-span-7 md:pt-8">
            <Reveal delay={0.4}>
              <p className="text-lg text-avorio/80 font-light leading-relaxed mb-6">
                La nostra Casa Funeraria accoglie le famiglie in un ambiente curato e
                riservato. Sala del Commiato con zona living, camera ardente
                personalizzabile e meeting room dedicata: ogni dettaglio è pensato
                per offrire un luogo di dignità e quiete.
              </p>
              <a
                href="#contatti"
                className="inline-flex items-center gap-2 text-oro-chiaro hover:text-avorio text-sm tracking-widest uppercase transition-colors group"
              >
                Prenota una visita{' '}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {gallery.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`group relative overflow-hidden ${
                i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto' : 'aspect-square'
              }`}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover photo-warm group-hover:scale-110 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
              <div className="absolute inset-0 bg-pietra/0 group-hover:bg-pietra/20 transition-colors duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
