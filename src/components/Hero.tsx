'use client';

import { Phone } from 'lucide-react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { RevealWords } from './motion/Reveal';
import MagneticButton from './motion/MagneticButton';
import { useT } from '@/i18n/LanguageProvider';
import { withItalyPhonePrefix, phoneTelHref } from '@/i18n/config';

export default function Hero() {
  const { t, locale } = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 1023px), (hover: none)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], isMobile ? ['0%', '0%'] : ['0%', '20%']);
  const scale = useTransform(scrollYProgress, [0, 1], isMobile ? [1, 1] : [1, 1.08]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-screen min-h-[680px] w-full overflow-hidden">
      <motion.div style={{ y, scale }} className="absolute inset-0 w-full h-full gpu">
        <img
          src="/img/new/cancello-sede.webp"
          alt="Sede Onoranze Funebri Coppola"
          className="absolute inset-0 w-full h-full object-cover object-[58%_60%] md:object-center photo-warm"
        />
        <div className="absolute inset-0 bg-pietra/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-pietra/70 via-pietra/50 to-pietra/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-pietra/60 via-transparent to-transparent" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative h-full container-custom flex flex-col justify-center">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex items-center gap-3 mb-8"
          >
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: 'left' }}
              className="block w-16 h-px bg-oro"
            />
            <span className="text-[11px] md:text-xs tracking-[0.25em] uppercase text-oro-chiaro font-medium">
              {t.hero.badge}
            </span>
          </motion.div>

          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-avorio leading-[1.1] font-light mb-6 md:mb-8">
            <RevealWords text={t.hero.title1} delay={0.3} />
            <br />
            <RevealWords
              text={t.hero.title2}
              delay={0.9}
              wordClassName="italic text-oro-chiaro"
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.6 }}
            className="text-base md:text-lg text-avorio/80 max-w-xl leading-relaxed font-light mb-8"
          >
            {t.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.9 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <MagneticButton
              href={phoneTelHref(locale)}
              className="inline-flex items-center gap-2 px-8 py-4 bg-bordeaux text-avorio tracking-wider uppercase text-sm font-medium hover:bg-bordeaux-dark transition-colors"
            >
              <WhatsAppIcon size={16} className="text-avorio md:hidden" />
              <Phone size={16} className="hidden md:inline-block" />
              {withItalyPhonePrefix(t.hero.callCta, locale)}
              <WhatsAppIcon size={16} className="text-oro-chiaro hidden md:inline-block" />
            </MagneticButton>
            <MagneticButton
              href="https://wa.me/390815713888"
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 px-8 py-4 border border-avorio/40 text-avorio tracking-wider uppercase text-sm font-medium hover:bg-avorio hover:text-pietra transition-colors"
            >
              <WhatsAppIcon size={16} />
              {t.hero.whatsappCta}
            </MagneticButton>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2.5 }}
          className="absolute bottom-10 left-0 right-0 container-custom hidden md:flex items-end justify-between text-avorio/60 text-[10px] md:text-xs tracking-widest uppercase"
        >
          <span>{t.hero.bottomServices}</span>
          <div className="flex items-center gap-3">
            <span>{t.hero.scroll}</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-px h-8 bg-oro"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
