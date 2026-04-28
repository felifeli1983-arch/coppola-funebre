'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MessageCircle } from 'lucide-react';
import Reveal, { RevealWords } from './motion/Reveal';

const faqs = [
  {
    q: 'Cosa fare in caso di decesso? A chi rivolgersi per primo?',
    a: 'In caso di decesso, la prima cosa da fare è chiamare il numero di reperibilità 24h: 081 571 3888. Risponderemo immediatamente e ci occuperemo di tutto: dal trasferimento della salma alle pratiche burocratiche. Non dovete preoccuparvi di nulla, ci pensiamo noi a coordinare medico, autorità e adempimenti.',
  },
  {
    q: 'Quali documenti servono per organizzare un funerale?',
    a: 'I documenti necessari sono: documento d\'identità del defunto, codice fiscale, certificato di morte rilasciato dal medico, e il documento d\'identità di chi si occuperà delle pratiche. Se ci sono volontà specifiche scritte (testamento biologico, disposizioni anticipate), portateli con voi. Il resto delle pratiche burocratiche viene gestito interamente dal nostro ufficio.',
  },
  {
    q: 'Quanto costa un funerale? È possibile avere un preventivo?',
    a: 'Il costo varia in base ai servizi richiesti: tipo di cerimonia, cofano scelto, cremazione o tumulazione, eventuali manifesti, fiori e auto. Offriamo soluzioni per ogni esigenza, sempre con preventivi chiari, dettagliati e privi di costi nascosti. Chiamateci o scriveteci per un preventivo gratuito senza impegno.',
  },
  {
    q: 'Come funziona la cremazione? Posso scegliere io?',
    a: 'Sì, la cremazione è una scelta libera. Per procedere serve la volontà espressa dal defunto (in vita) o, in mancanza, una dichiarazione dei familiari resa davanti all\'ufficiale di stato civile. Ci occupiamo noi del coordinamento con il forno crematorio, del rito di commiato e della consegna dell\'urna ai familiari, in tempi brevi.',
  },
  {
    q: 'Cos\'è la Casa Funeraria e perché sceglierla?',
    a: 'La nostra Casa Funeraria è uno spazio dedicato dove le famiglie possono salutare i propri cari in un ambiente curato, riservato e accessibile 24 ore su 24. Comprende Sala del Commiato con zona living, camera ardente personalizzabile e meeting room dedicata. È pensata per offrire dignità e quiete in un momento delicato.',
  },
  {
    q: 'Cos\'è il Contratto di Previdenza Funebre?',
    a: 'È uno strumento per pianificare in anticipo le proprie esequie, scegliendo ogni dettaglio in piena lucidità e bloccando i prezzi al momento della sottoscrizione. Solleva i propri cari dalla preoccupazione economica e da decisioni difficili nel momento del dolore. Il contratto è trasparente, senza vincoli nascosti, e adattabile nel tempo.',
  },
  {
    q: 'Organizzate funerali laici o di altre religioni?',
    a: 'Sì, organizziamo cerimonie di ogni tipo: cattoliche, ortodosse, evangeliche, ebraiche, islamiche, buddiste, civili o laiche. Rispettiamo l\'identità culturale e religiosa di ogni famiglia, consentendo diverse forme di commemorazione all\'interno delle nostre strutture o nei luoghi di culto richiesti.',
  },
  {
    q: 'Vi occupate anche di trasporti internazionali e rimpatri?',
    a: 'Sì, gestiamo trasporti funebri nazionali e internazionali, inclusi i rimpatri da e verso l\'estero. Coordiniamo direttamente con Consolati, Ambasciate e autorità sanitarie per tutte le pratiche necessarie (certificati, permessi, autorizzazioni doganali). Ci occupiamo di ogni dettaglio logistico e documentale.',
  },
  {
    q: 'Posso pubblicare un necrologio o un manifesto?',
    a: 'Certamente. Ci occupiamo della stampa e affissione di manifesti funebri, della pubblicazione di necrologi sui principali quotidiani locali e nazionali, e della redazione del testo se desiderate. Vi proponiamo modelli diversi tra cui scegliere, oppure realizziamo qualcosa di personalizzato in base alle vostre richieste.',
  },
  {
    q: 'Quanto tempo prima del funerale bisogna contattarvi?',
    a: 'Prima possibile, anche subito dopo il decesso. Più tempo abbiamo, meglio possiamo organizzare tutto secondo le vostre volontà. Comunque, anche con poche ore di preavviso siamo in grado di gestire l\'intera organizzazione: la nostra reperibilità è 24/7, 365 giorni l\'anno, proprio per garantire un servizio tempestivo in qualsiasi momento.',
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number[]>([]);

  const toggle = (i: number) => {
    setOpen((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
  };

  // Schema.org FAQPage JSON-LD for SEO (Google rich results)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
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
              <span className="eyebrow">Domande frequenti</span>
            </div>
          </Reveal>
          <h2 className="section-title mb-6">
            <RevealWords text="Le risposte" />
            <br />
            <RevealWords text="ai vostri dubbi." delay={0.3} wordClassName="italic text-bordeaux" />
          </h2>
          <Reveal delay={0.5}>
            <p className="text-base md:text-lg text-pietra-chiaro font-light leading-relaxed mb-8">
              Abbiamo raccolto le domande che ci vengono poste più spesso. Se non
              trovate la vostra, contattateci: siamo qui per aiutarvi a chiarire
              ogni aspetto, in totale tranquillità.
            </p>
          </Reveal>
          <Reveal delay={0.7}>
            <a
              href="tel:0815713888"
              className="btn-primary group"
            >
              <MessageCircle size={16} />
              Hai un&apos;altra domanda?
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
                          {f.a}
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
