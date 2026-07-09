'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageCircle } from 'lucide-react';
import Reveal, { RevealWords } from './motion/Reveal';
import { useT } from '@/i18n/LanguageProvider';
import it from '@/i18n/dictionaries/it';
import { withItalyPhonePrefix, phoneTelHref } from '@/i18n/config';

export default function Faq() {
  const { t, locale } = useT();
  const faqs = t.faq.items;
  const [open, setOpen] = useState<number[]>([]);

  const toggle = (i: number) => {
    setOpen((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  // Schema.org FAQPage JSON-LD for SEO — always Italian (the canonical language)
  // so Google rich results stay consistent regardless of the visitor's locale.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: it.faq.items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-avorio">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container-custom grid lg:grid-cols-12 gap-10 lg:gap-16">
        <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="divider-line" />
              <span className="eyebrow">{t.faq.eyebrow}</span>
            </div>
          </Reveal>
          <h2 className="section-title mb-6">
            <RevealWords text={t.faq.title1} />
            <br />
            <RevealWords text={t.faq.title2} delay={0.3} wordClassName="italic text-bordeaux" />
          </h2>
          <Reveal delay={0.5}>
            <p className="text-base md:text-lg text-pietra-chiaro font-light leading-relaxed mb-8">
              {t.faq.intro}
            </p>
          </Reveal>
          <Reveal delay={0.7}>
            <a
              href={phoneTelHref(locale)}
              className="btn-primary group"
            >
              <MessageCircle size={16} />
              {t.faq.cta}
            </a>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <ul className="border-t border-pietra/10">
            {faqs.map((f, i) => {
              const isOpen = open.includes(i);
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-5% 0px' }}
                  transition={{ duration: 0.7, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-pietra/10"
                >
                  <button
                    onClick={() => toggle(i)}
                    className="w-full flex items-start justify-between gap-6 py-6 md:py-7 text-left group"
                    aria-expanded={isOpen}
                  >
                    <span className="font-serif text-lg md:text-xl text-pietra group-hover:text-bordeaux transition-colors leading-snug">
                      {f.q}
                    </span>
                    <span
                      className={`flex-none w-8 h-8 border border-pietra/20 flex items-center justify-center transition-all duration-500 ${
                        isOpen
                          ? 'bg-bordeaux border-bordeaux text-avorio rotate-45'
                          : 'text-pietra group-hover:border-bordeaux group-hover:text-bordeaux'
                      }`}
                    >
                      <Plus size={16} strokeWidth={1.5} />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pb-7 pr-12 text-base md:text-lg text-pietra-chiaro font-light leading-relaxed">
                          {withItalyPhonePrefix(f.a, locale)}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
