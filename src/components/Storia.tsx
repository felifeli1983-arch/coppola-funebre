'use client';

import Reveal, { RevealImage, RevealWords } from './motion/Reveal';
import Counter from './motion/Counter';

export default function Storia() {
  return (
    <section id="storia" className="py-24 md:py-32 bg-avorio">
      <div className="container-custom grid md:grid-cols-12 gap-12 md:gap-16 items-center">
        <div className="md:col-span-5">
          <div className="relative">
            <RevealImage
              src="/img/new/sede-esterno.jpg"
              alt="Sede Impresa Coppola"
              className="w-full aspect-[4/5]"
            />
            <Reveal delay={0.8}>
              <div className="absolute -bottom-5 -right-5 bg-bordeaux text-avorio px-6 py-5 hidden md:block">
                <div className="font-serif text-3xl leading-none">
                  <Counter to={100} suffix="+" />
                </div>
                <div className="text-[10px] tracking-widest uppercase mt-1 text-oro-chiaro">
                  Anni di attività
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        <div className="md:col-span-7">
          <Reveal>
            <div className="flex items-center gap-3 mb-4">
              <span className="divider-line" />
              <span className="eyebrow">La nostra storia</span>
            </div>
          </Reveal>

          <h2 className="section-title mb-8">
            <RevealWords text="Oltre un secolo" />
            <br />
            <RevealWords text="accanto alle famiglie." delay={0.3} wordClassName="italic text-bordeaux" />
          </h2>

          <Reveal delay={0.4}>
            <div className="space-y-5 text-base md:text-lg text-pietra-chiaro leading-relaxed font-light">
              <p>
                Quattro generazioni. Un secolo di dedizione silenziosa. L&apos;Impresa
                Funebre Coppola nasce con una promessa semplice: accompagnare ogni
                famiglia nel momento più difficile con rispetto, professionalità
                e discrezione.
              </p>
              <p>
                A conduzione familiare, custodiamo tradizioni antiche unite a un
                servizio contemporaneo. La nostra Casa Funeraria, la flotta di
                prestigio e le otto sedi sul territorio rispondono a un unico
                principio: <em className="text-bordeaux not-italic font-medium">un servizio
                esclusivo alla portata di tutti</em>.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.6}>
            <div className="grid grid-cols-3 gap-6 mt-12 pt-10 border-t border-pietra/10">
              <div>
                <div className="font-serif text-3xl md:text-4xl text-bordeaux">
                  <Counter to={100} suffix="+" />
                </div>
                <div className="text-xs tracking-widest uppercase text-pietra-chiaro mt-2">
                  Anni di attività
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl md:text-4xl text-bordeaux">
                  <Counter to={8} />
                </div>
                <div className="text-xs tracking-widest uppercase text-pietra-chiaro mt-2">
                  Sedi territoriali
                </div>
              </div>
              <div>
                <div className="font-serif text-3xl md:text-4xl text-bordeaux">
                  <Counter to={24} suffix="h" />
                </div>
                <div className="text-xs tracking-widest uppercase text-pietra-chiaro mt-2">
                  Reperibilità
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
