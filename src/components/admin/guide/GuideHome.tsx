'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleDashed,
  Globe,
  Search,
  ShoppingBag,
  Sparkles,
  Users,
  BellRing,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/primitives';
import { useShell } from '@/components/admin/shell/AdminShell';
import { GROUP_LABEL, type Block, type GuideGroup } from '@/lib/admin/guide/types';
import { GUIDE_TOPICS } from '@/lib/admin/guide/content';
import { guideIcon } from './icons';
import { plain, Rich } from './Rich';
import { markGuideDone, onGuideProgress, readGuideDone, toggleGuideDone } from './progress';
import { startAdminTour } from './Tour';
import { PlayCircle } from 'lucide-react';

export type GuideFacts = {
  businessData: boolean;
  shipping: boolean;
  productsTotal: number;
  productsWithPhotos: number;
  contacts: number;
  reminders: number;
  admins: number;
};

type CheckItem = {
  id: string;
  title: string;
  text: string;
  href?: string;
  cta: string;
  auto?: boolean;
  done: boolean;
  progress?: { done: number; total: number };
  onClick?: () => void;
};

// ── Search index ─────────────────────────────────────────────────────────
function blockText(b: Block): string {
  switch (b.type) {
    case 'p':
      return b.text;
    case 'steps':
      return [b.title ?? '', ...b.items.map((i) => `${i.title} ${i.text ?? ''}`)].join(' ');
    case 'list':
      return [b.title ?? '', ...b.items].join(' ');
    case 'callout':
      return `${b.title ?? ''} ${b.text}`;
    case 'fields':
      return b.items.map((f) => `${f.label} ${f.text}`).join(' ');
    case 'faq':
      return b.items.map((f) => `${f.q} ${f.a}`).join(' ');
    case 'links':
      return b.items.map((l) => l.label).join(' ');
    default:
      return '';
  }
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

const INDEX = GUIDE_TOPICS.flatMap((t) =>
  t.sections.map((s) => ({
    topic: t,
    section: s,
    title: s.title,
    body: plain(s.blocks.map(blockText).join(' ')),
    haystack: norm(`${t.title} ${t.keywords ?? ''} ${s.title} ${plain(s.blocks.map(blockText).join(' '))}`),
  })),
);

function snippet(body: string, terms: string[]): string {
  const n = norm(body);
  const pos = Math.max(0, ...terms.map((t) => n.indexOf(t)).filter((p) => p >= 0).slice(0, 1));
  const start = Math.max(0, pos - 60);
  return (start > 0 ? '…' : '') + body.slice(start, start + 170).trim() + (body.length > start + 170 ? '…' : '');
}

export default function GuideHome({ facts }: { facts: GuideFacts }) {
  const { setCommandOpen } = useShell();
  const [q, setQ] = React.useState('');
  const [done, setDone] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const sync = () => setDone(readGuideDone());
    sync();
    return onGuideProgress(sync);
  }, []);

  const terms = norm(q).split(/\s+/).filter((t) => t.length > 1);
  const results = terms.length
    ? INDEX.filter((r) => terms.every((t) => r.haystack.includes(t))).slice(0, 12)
    : [];

  const items: CheckItem[] = [
    {
      id: 'dati',
      title: 'Completa i dati dell’attività',
      text: 'Nome, recapiti, indirizzo e dati fiscali usati in tutto il gestionale.',
      href: '/admin/impostazioni',
      cta: 'Apri Dati attività',
      auto: true,
      done: facts.businessData,
    },
    {
      id: 'foto',
      title: 'Carica le foto dei prodotti',
      text: 'I prodotti con foto vendono molto di più: la prima foto è la copertina.',
      href: '/admin/prodotti',
      cta: 'Vai ai prodotti',
      auto: true,
      done: facts.productsTotal > 0 && facts.productsWithPhotos >= facts.productsTotal,
      progress: { done: facts.productsWithPhotos, total: facts.productsTotal },
    },
    {
      id: 'spedizioni',
      title: 'Controlla i costi di spedizione',
      text: 'Costo standard e soglia oltre la quale la spedizione è gratuita.',
      href: '/admin/spedizioni',
      cta: 'Apri Spedizioni',
      auto: true,
      done: facts.shipping,
    },
    {
      id: 'contatto',
      title: 'Aggiungi il primo contatto',
      text: 'Una famiglia, un cliente o un fornitore: tutto parte dalla rubrica.',
      href: '/admin/clienti/nuovo',
      cta: 'Nuovo contatto',
      auto: true,
      done: facts.contacts > 0,
    },
    {
      id: 'promemoria',
      title: 'Programma un promemoria',
      text: 'Un richiamo o una scadenza: il gestionale te lo ricorderà.',
      href: '/admin/attivita?nuova=1',
      cta: 'Nuova attività',
      auto: true,
      done: facts.reminders > 0,
    },
    {
      id: 'team',
      title: 'Aggiungi i collaboratori',
      text: 'Ogni persona deve avere il proprio accesso, con la propria password.',
      href: '/admin/impostazioni/utenti',
      cta: 'Utenti e accesso',
      auto: true,
      done: facts.admins > 1,
    },
    {
      id: 'legale',
      title: 'Rileggi Privacy e Cookie Policy',
      text: 'Verifica che i testi pubblicati sul sito siano corretti e aggiornati.',
      href: '/admin/legale/privacy',
      cta: 'Apri l’editor',
      done: done.has('legale'),
    },
    {
      id: 'ricerca',
      title: 'Prova la ricerca rapida',
      text: 'Trova qualsiasi contatto, ordine o prodotto in un istante.',
      cta: 'Prova ora',
      done: done.has('ricerca'),
      onClick: () => {
        setCommandOpen(true);
        markGuideDone('ricerca');
      },
    },
  ];
  const completed = items.filter((i) => i.done).length;
  const pct = Math.round((completed / items.length) * 100);

  const groups = (Object.keys(GROUP_LABEL) as GuideGroup[])
    .map((g) => ({ g, topics: GUIDE_TOPICS.filter((t) => t.group === g) }))
    .filter((x) => x.topics.length);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/[0.07] via-background to-background px-5 py-8 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-primary/[0.06] blur-2xl" />
        <div className="relative max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border bg-background/70 px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <BookOpen className="size-3.5 text-primary" /> Guida all’uso
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-4xl">Come funziona il gestionale</h1>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
            Tutto quello che serve per lavorare con clienti, ordini, prodotti e contenuti del sito. Ogni sezione
            spiega cosa vedi, cosa fare passo passo e cosa succede in automatico — con esempi da provare.
          </p>
          <Button variant="outline" size="sm" className="mt-5 bg-background/70" onClick={startAdminTour}>
            <PlayCircle /> Rivedi il tour guidato
          </Button>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cosa vuoi fare? Es. “caricare foto”, “tracking”, “promemoria”…"
              className="h-12 rounded-xl bg-background pl-10 pr-10 text-base shadow-sm"
              aria-label="Cerca nella guida"
            />
            {q && (
              <button
                onClick={() => setQ('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label="Cancella ricerca"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search results */}
      {terms.length > 0 && (
        <div className="mt-6">
          <div className="mb-3 text-sm text-muted-foreground">
            {results.length ? `${results.length} risultati per “${q.trim()}”` : `Nessun risultato per “${q.trim()}”. Prova con altre parole.`}
          </div>
          <div className="grid gap-2">
            {results.map((r) => {
              const Icon = guideIcon(r.topic.icon);
              return (
                <Link key={`${r.topic.id}-${r.section.id}`} href={`/admin/guida/${r.topic.id}#${r.section.id}`} className="group block min-w-0">
                  <Card className="flex gap-3 p-4 transition-colors group-hover:bg-muted/40">
                    <span className="flex size-9 flex-none items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm">
                        <span className="text-muted-foreground">{r.topic.title} › </span>
                        <span className="font-medium">{r.title}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{snippet(r.body, terms)}</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Getting started checklist */}
      {terms.length === 0 && (
        <>
          <Card className="mt-6 overflow-hidden">
            <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 font-semibold">
                  <Sparkles className="size-4 text-primary" /> Primi passi
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Le voci con il simbolo “auto” si spuntano da sole quando il lavoro è fatto.
                </p>
              </div>
              <div className="flex items-center gap-3 sm:w-64">
                <Progress value={pct} className="h-2" />
                <span className="flex-none text-sm font-medium tabular-nums">
                  {completed}/{items.length}
                </span>
              </div>
            </div>
            <ul className="grid divide-y md:grid-cols-2 md:divide-y-0">
              {items.map((it, i) => (
                <li
                  key={it.id}
                  className={cn(
                    'flex gap-3 px-5 py-4',
                    'md:border-b',
                    i % 2 === 0 && 'md:border-r',
                  )}
                >
                  <button
                    type="button"
                    disabled={it.auto}
                    onClick={() => toggleGuideDone(it.id)}
                    className={cn(
                      'mt-0.5 flex size-6 flex-none items-center justify-center rounded-full border-2 transition-colors',
                      it.done ? 'border-success bg-success text-success-foreground' : 'border-muted-foreground/30 text-transparent',
                      !it.auto && !it.done && 'hover:border-success/60',
                    )}
                    aria-label={it.done ? 'Completato' : 'Segna come fatto'}
                    title={it.auto ? 'Si spunta da solo' : 'Clicca per segnare come fatto'}
                  >
                    {it.done ? <Check className="size-3.5" strokeWidth={3} /> : <CircleDashed className="size-3.5 text-muted-foreground/40" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('font-medium', it.done && 'text-muted-foreground line-through decoration-muted-foreground/40')}>
                        {it.title}
                      </span>
                      {it.auto && (
                        <span className="rounded bg-info/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-info">auto</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{it.text}</p>
                    {it.progress && it.progress.total > 0 && !it.done && (
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={(it.progress.done / it.progress.total) * 100} className="h-1.5 max-w-[180px]" />
                        <span className="text-xs tabular-nums text-muted-foreground">
                          {it.progress.done} di {it.progress.total} con foto
                        </span>
                      </div>
                    )}
                    {!it.done &&
                      (it.href ? (
                        <Link href={it.href} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                          {it.cta} <ArrowRight className="size-3.5" />
                        </Link>
                      ) : (
                        <button onClick={it.onClick} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                          {it.cta} <ArrowRight className="size-3.5" />
                        </button>
                      ))}
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {/* How things connect */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold tracking-tight">Come si collega tutto</h2>
            <p className="mt-1 text-sm text-muted-foreground">Il percorso tipico: dal sito al cliente, senza ricopiare nulla a mano.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: Globe, title: 'Il cliente ordina sul sito', text: 'Sceglie i prodotti nel negozio e completa l’ordine.', href: '/admin/guida/ordini' },
                { icon: ShoppingBag, title: 'Arriva l’ordine', text: 'Compare in Ordini con un numero rosso nel menu: è da gestire.', href: '/admin/guida/ordini' },
                { icon: Users, title: 'Il cliente entra nel CRM', text: 'Viene creato o aggiornato da solo in Contatti, con l’ordine nella cronologia.', href: '/admin/guida/contatti' },
                { icon: BellRing, title: 'Segui la relazione', text: 'Chiamate, note e promemoria restano nella scheda del cliente.', href: '/admin/guida/attivita' },
              ].map((s, i) => (
                <Link key={s.title} href={s.href} className="group relative block min-w-0">
                  <Card className="h-full p-4 transition-colors group-hover:bg-muted/40">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        {i + 1}
                      </span>
                      <s.icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="mt-3 font-medium">{s.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Topics */}
          {groups.map(({ g, topics }) => (
            <div key={g} className="mt-10">
              <h2 className="text-lg font-semibold tracking-tight">{GROUP_LABEL[g]}</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topics.map((t) => {
                  const Icon = guideIcon(t.icon);
                  const read = done.has(`letto:${t.id}`);
                  return (
                    <Link key={t.id} href={`/admin/guida/${t.id}`} className="group block min-w-0">
                      <Card className="flex h-full flex-col p-5 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Icon className="size-5" />
                          </span>
                          {read && (
                            <span className="inline-flex items-center gap-1 text-xs text-success">
                              <Check className="size-3.5" /> Letto
                            </span>
                          )}
                        </div>
                        <div className="mt-3 font-semibold">{t.title}</div>
                        <p className="mt-1 line-clamp-3 flex-1 text-sm text-muted-foreground">
                          <Rich text={t.summary} />
                        </p>
                        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                          <span>{t.readingMinutes} min</span>
                          <span className="inline-flex items-center gap-1 font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                            Leggi <ArrowRight className="size-3.5" />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
