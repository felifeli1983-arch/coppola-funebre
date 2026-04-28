'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, Check, Settings } from 'lucide-react';

const STORAGE_KEY = 'coppola-cookie-consent';

type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: number;
};

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (c: Omit<Consent, 'ts' | 'necessary'>) => {
    const consent: Consent = { necessary: true, ...c, ts: Date.now() };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch {}
    setVisible(false);
  };

  const acceptAll = () => save({ analytics: true, marketing: true });
  const rejectAll = () => save({ analytics: false, marketing: false });
  const saveCustom = () => save({ analytics, marketing });

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-0 md:bottom-6 left-0 right-0 md:left-6 md:right-6 z-[55] mb-14 md:mb-0"
        >
          <div className="max-w-4xl mx-auto bg-avorio shadow-2xl border border-pietra/15 overflow-hidden">
            {!showSettings ? (
              <div className="p-6 md:p-8">
                <div className="flex items-start gap-4 mb-5">
                  <div className="hidden sm:flex w-12 h-12 bg-bordeaux text-avorio items-center justify-center flex-none">
                    <Cookie size={20} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-xl md:text-2xl mb-2 text-pietra">
                      Rispettiamo la tua privacy
                    </h3>
                    <p className="text-sm md:text-base text-pietra-chiaro font-light leading-relaxed">
                      Utilizziamo cookie tecnici essenziali per il funzionamento del
                      sito e, previo consenso, cookie analitici per migliorare la
                      tua esperienza. Puoi accettare tutti, rifiutare quelli non
                      essenziali o personalizzare le preferenze.{' '}
                      <a
                        href="/cookie-policy"
                        className="text-bordeaux underline decoration-1 underline-offset-2 hover:text-bordeaux-dark"
                      >
                        Cookie Policy
                      </a>
                    </p>
                  </div>
                  <button
                    onClick={rejectAll}
                    className="hidden md:block text-pietra/40 hover:text-pietra transition-colors p-1"
                    aria-label="Chiudi (solo cookie necessari)"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <button
                    onClick={acceptAll}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-bordeaux text-avorio tracking-widest uppercase text-xs font-medium hover:bg-bordeaux-dark transition-colors order-1 sm:order-3 sm:ml-auto"
                  >
                    <Check size={14} />
                    Accetta tutti
                  </button>
                  <button
                    onClick={rejectAll}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-pietra/25 text-pietra tracking-widest uppercase text-xs font-medium hover:bg-pietra hover:text-avorio transition-colors order-2"
                  >
                    Solo necessari
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 text-pietra tracking-widest uppercase text-xs font-medium hover:text-bordeaux transition-colors order-3 sm:order-1"
                  >
                    <Settings size={14} />
                    Personalizza
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <h3 className="font-serif text-xl md:text-2xl text-pietra">
                    Preferenze cookie
                  </h3>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-pietra/40 hover:text-pietra transition-colors p-1"
                    aria-label="Chiudi"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-5 mb-7">
                  <div className="flex items-start justify-between gap-4 pb-5 border-b border-pietra/10">
                    <div className="flex-1">
                      <div className="font-serif text-lg text-pietra mb-1">
                        Cookie necessari
                      </div>
                      <p className="text-sm text-pietra-chiaro font-light">
                        Strettamente necessari al funzionamento del sito.
                        Sempre attivi.
                      </p>
                    </div>
                    <div className="text-[10px] tracking-widest uppercase text-oro flex-none mt-2">
                      Sempre attivi
                    </div>
                  </div>

                  <label className="flex items-start justify-between gap-4 pb-5 border-b border-pietra/10 cursor-pointer">
                    <div className="flex-1">
                      <div className="font-serif text-lg text-pietra mb-1">
                        Cookie analitici
                      </div>
                      <p className="text-sm text-pietra-chiaro font-light">
                        Ci aiutano a capire come gli utenti usano il sito,
                        in forma anonima e aggregata.
                      </p>
                    </div>
                    <Switch checked={analytics} onChange={setAnalytics} />
                  </label>

                  <label className="flex items-start justify-between gap-4 cursor-pointer">
                    <div className="flex-1">
                      <div className="font-serif text-lg text-pietra mb-1">
                        Cookie di marketing
                      </div>
                      <p className="text-sm text-pietra-chiaro font-light">
                        Attualmente non utilizzati. Disponibili per future
                        attività promozionali.
                      </p>
                    </div>
                    <Switch checked={marketing} onChange={setMarketing} />
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={saveCustom}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-bordeaux text-avorio tracking-widest uppercase text-xs font-medium hover:bg-bordeaux-dark transition-colors flex-1"
                  >
                    Salva preferenze
                  </button>
                  <button
                    onClick={acceptAll}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-pietra/25 text-pietra tracking-widest uppercase text-xs font-medium hover:bg-pietra hover:text-avorio transition-colors"
                  >
                    Accetta tutti
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Switch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 flex-none rounded-full transition-colors duration-300 ${
        checked ? 'bg-bordeaux' : 'bg-pietra/20'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-avorio shadow transition-transform duration-300 ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      />
    </button>
  );
}
