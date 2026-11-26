'use client';

// First-login onboarding: a welcome dialog followed by a spotlight tour over
// the real admin UI. Elements opt in with data-tour="<id>". Completion is
// stored on the user account (auth user_metadata.tour_done) so it shows once
// per person, on any device. `startAdminTour()` replays it on demand.

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, Sparkles, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const START_EVT = 'admin-tour-start';
export function startAdminTour() {
  window.dispatchEvent(new Event(START_EVT));
}

type Step = {
  /** data-tour target for desktop / mobile (first one found & visible wins). */
  targets: string[];
  title: string;
  text: string;
};

const STEPS: Step[] = [
  {
    targets: ['sidebar', 'mobile-menu'],
    title: 'Il menu',
    text: 'Qui trovi tutte le sezioni, raggruppate per argomento: CRM, Negozio, Analisi, Contenuti, Impostazioni e Aiuto. Su telefono si apre da questo pulsante e si chiude da solo quando scegli una pagina.',
  },
  {
    targets: ['nav-ordini', 'mobile-menu'],
    title: 'I numeri rossi',
    text: 'Accanto a “Ordini” e “Attività” compare un numero quando c’è qualcosa da fare: ordini da gestire, promemoria scaduti o per oggi.',
  },
  {
    targets: ['search'],
    title: 'Ricerca rapida',
    text: 'Trova subito un contatto, un ordine (scrivi #12) o un prodotto. Funziona anche con la scorciatoia ⌘K (su Windows Ctrl+K).',
  },
  {
    targets: ['help'],
    title: 'Aiuto sempre a portata di mano',
    text: 'Il punto di domanda apre la guida della pagina in cui ti trovi: cosa vedi, cosa fare passo passo e cosa succede in automatico.',
  },
  {
    targets: ['collapse'],
    title: 'Più spazio quando serve',
    text: 'Riduci il menu a una colonna di icone (anche con ⌘B / Ctrl+B). Il gestionale ricorda la tua scelta.',
  },
  {
    targets: ['user-menu'],
    title: 'Il tuo account',
    text: 'Da qui cambi la password, apri il sito o esci. Ricordati di uscire quando usi un computer condiviso.',
  },
];

function findTarget(ids: string[]): HTMLElement | null {
  for (const id of ids) {
    const els = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${id}"]`));
    const el = els.find((e) => {
      const r = e.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden';
    });
    if (el) return el;
  }
  return null;
}

export default function AdminTour({ autoStart, userName }: { autoStart: boolean; userName: string }) {
  const router = useRouter();
  const [phase, setPhase] = React.useState<'idle' | 'welcome' | 'tour' | 'end'>('idle');
  const [i, setI] = React.useState(0);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    if (autoStart) {
      const t = setTimeout(() => setPhase('welcome'), 600);
      return () => clearTimeout(t);
    }
  }, [autoStart]);

  React.useEffect(() => {
    const start = () => {
      setI(0);
      setPhase('welcome');
    };
    window.addEventListener(START_EVT, start);
    return () => window.removeEventListener(START_EVT, start);
  }, []);

  // Track the highlighted element's position (scroll/resize aware).
  React.useLayoutEffect(() => {
    if (phase !== 'tour') return;
    const step = STEPS[i];
    const update = () => {
      const el = findTarget(step.targets);
      setRect(el ? el.getBoundingClientRect() : null);
    };
    const el = findTarget(step.targets);
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    const iv = setInterval(update, 400); // follows sidebar collapse animations
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
      clearInterval(iv);
    };
  }, [phase, i]);

  const persistDone = React.useCallback(async () => {
    try {
      await createClient().auth.updateUser({ data: { tour_done: true } });
    } catch {
      /* not critical */
    }
  }, []);

  const finish = (goToGuide: boolean) => {
    setPhase('idle');
    persistDone();
    if (goToGuide) router.push('/admin/guida');
  };

  // Keyboard: ← → Esc
  React.useEffect(() => {
    if (phase !== 'tour') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish(false);
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') setI((x) => Math.max(0, x - 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i]);

  const next = () => {
    if (i < STEPS.length - 1) setI(i + 1);
    else setPhase('end');
  };

  const firstName = userName.split(/[\s@.]/)[0];
  const greeting = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : '';

  return (
    <>
      {/* Welcome */}
      <Dialog open={phase === 'welcome'} onOpenChange={(o) => !o && finish(false)}>
        <DialogContent className="max-w-md overflow-hidden p-0">
          <div className="bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent px-6 pb-5 pt-7">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="size-5" />
            </span>
            <DialogTitle className="mt-4 text-xl">Benvenuto{greeting ? `, ${greeting}` : ''}!</DialogTitle>
            <DialogDescription className="mt-1.5 text-[15px] leading-6">
              Questo è il gestionale di Eredi Coppola: contatti, ordini del negozio, prodotti e contenuti del sito in un unico posto.
            </DialogDescription>
          </div>
          <div className="px-6 pb-6">
            <ul className="grid gap-2 text-sm text-muted-foreground">
              <li>• Un tour di un minuto ti mostra dove si trova tutto.</li>
              <li>• Puoi rivederlo quando vuoi dalla Guida all’uso.</li>
              <li>• Il punto di domanda in alto spiega ogni pagina.</li>
            </ul>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => finish(false)}>
                Salta, lo farò dopo
              </Button>
              <Button
                onClick={() => {
                  setI(0);
                  setPhase('tour');
                }}
              >
                Inizia il tour <ArrowRight />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Spotlight */}
      {phase === 'tour' && (
        <Spotlight
          rect={rect}
          step={STEPS[i]}
          index={i}
          total={STEPS.length}
          onNext={next}
          onPrev={() => setI((x) => Math.max(0, x - 1))}
          onClose={() => finish(false)}
        />
      )}

      {/* End */}
      <Dialog open={phase === 'end'} onOpenChange={(o) => !o && finish(false)}>
        <DialogContent className="max-w-md">
          <span className="flex size-11 items-center justify-center rounded-xl bg-success/10 text-success">
            <BookOpen className="size-5" />
          </span>
          <DialogTitle className="text-xl">Tutto pronto!</DialogTitle>
          <DialogDescription className="text-[15px] leading-6">
            Nella <b>Guida all’uso</b> trovi ogni sezione spiegata passo passo, esempi da provare e la lista dei
            <b> Primi passi</b> per mettere in ordine il gestionale.
          </DialogDescription>
          <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => finish(false)}>
              Inizia a lavorare
            </Button>
            <Button onClick={() => finish(true)}>
              Apri la guida <ArrowRight />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Spotlight({
  rect,
  step,
  index,
  total,
  onNext,
  onPrev,
  onClose,
}: {
  rect: DOMRect | null;
  step: Step;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}) {
  const pad = 6;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
  const cardW = Math.min(340, vw - 24);

  // Card placement: right of tall/left elements (sidebar), else below/above.
  let cardStyle: React.CSSProperties = { left: (vw - cardW) / 2, top: vh / 2 - 100 };
  if (rect) {
    const spaceRight = vw - rect.right;
    if (rect.height > vh * 0.5 && spaceRight > cardW + 24) {
      cardStyle = { left: rect.right + 16, top: Math.max(16, Math.min(vh - 260, rect.top + 80)) };
    } else {
      const below = rect.bottom + 14;
      const left = Math.max(12, Math.min(vw - cardW - 12, rect.left + rect.width / 2 - cardW / 2));
      cardStyle = below + 230 < vh ? { left, top: below } : { left, top: Math.max(12, rect.top - 244) };
    }
  }

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={step.title}>
      {/* Dim layer with a hole around the target */}
      {rect ? (
        <div
          className="pointer-events-none fixed rounded-lg ring-2 ring-primary transition-all duration-300 ease-out"
          style={{
            left: rect.left - pad,
            top: rect.top - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
            boxShadow: '0 0 0 9999px rgba(15, 10, 10, 0.55)',
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/55" />
      )}
      {/* Click-catcher (clicking outside does nothing destructive) */}
      <div className="fixed inset-0" onClick={(e) => e.stopPropagation()} />

      <div
        className="fixed rounded-xl border bg-popover p-4 text-popover-foreground shadow-2xl transition-all duration-300 ease-out animate-in fade-in-0 zoom-in-95"
        style={{ ...cardStyle, width: cardW }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="text-xs font-medium text-muted-foreground">
            Passo {index + 1} di {total}
          </div>
          <button onClick={onClose} className="-m-1 rounded p-1 text-muted-foreground hover:text-foreground" aria-label="Chiudi il tour">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-1 font-semibold">{step.title}</div>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{step.text}</p>
        <div className="mt-4 flex items-center gap-2">
          <div className="flex flex-1 gap-1">
            {Array.from({ length: total }).map((_, k) => (
              <span key={k} className={cn('h-1.5 rounded-full transition-all', k === index ? 'w-5 bg-primary' : 'w-1.5 bg-muted-foreground/25')} />
            ))}
          </div>
          {index > 0 && (
            <Button size="sm" variant="ghost" onClick={onPrev}>
              <ArrowLeft /> Indietro
            </Button>
          )}
          <Button size="sm" onClick={onNext}>
            {index === total - 1 ? 'Fine' : 'Avanti'} <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}
