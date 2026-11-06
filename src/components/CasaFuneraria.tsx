'use client';

import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Reveal, { RevealWords } from './motion/Reveal';
import { useT } from '@/i18n/LanguageProvider';

const gallery = [
  '/img/new/sala-commiato.webp',
  '/img/new/interno-8.jpg',
  '/img/hero-2.jpg',
];

export default function CasaFuneraria() {
  const { t } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px), (hover: none)');
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
        <div className="absolute inset-0 bg-[url('/img/new/sala-commiato.webp')] bg-cover bg-center" />
      </motion.div>

      <div className="relative container-custom">
        <div className="grid md:grid-cols-12 gap-10 md:gap-16 mb-16">
          <div className="md:col-span-5">
            <Reveal>
              <div className="flex items-center gap-3 mb-4">
                <span className="divider-line bg-oro" />
                <span className="text-xs tracking-widest uppercase text-oro font-medium">
                  {t.casa.eyebrow}
                </span>
              </div>
            </Reveal>
            <h2 className="section-title text-avorio">
              <RevealWords text={t.casa.title1} />
              <br />
              <RevealWords text={t.casa.title2} delay={0.3} wordClassName="italic text-oro-chiaro" />
            </h2>
          </div>
          <div className="md:col-span-7 md:pt-8">
            <Reveal delay={0.4}>
              <p className="text-lg text-avorio/80 font-light leading-relaxed mb-6">
                {t.casa.body}
              </p>
              <a
                href="#contatti"
                className="inline-flex items-center gap-2 text-oro-chiaro hover:text-avorio text-sm tracking-widest uppercase transition-colors group"
              >
                {t.casa.cta}{' '}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </Reveal>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          {gallery.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative overflow-hidden aspect-[4/3]"
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover object-center photo-warm group-hover:scale-110 transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
              />
              <div className="absolute inset-0 bg-pietra/0 group-hover:bg-pietra/20 transition-colors duration-700" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
