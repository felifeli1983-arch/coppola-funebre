'use client';

import * as React from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Hand,
  Keyboard,
  Menu,
  Moon,
  MousePointerClick,
  PanelLeftClose,
  RotateCcw,
  Search,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
import { DataTable, SortHeader, facetFilterFn, selectColumn } from '@/components/admin/data-table';
import { ActivityIcon, OrderStatusBadge, StageBadge, StockBadge } from '@/components/admin/status';
import { useShell } from '@/components/admin/shell/AdminShell';
import { ACTIVITY_MANUAL_TYPES, ACTIVITY_TYPE, CONTACT_SOURCE, CONTACT_STAGE, CONTACT_STAGE_KEYS, ORDER_STATUS } from '@/lib/admin/meta';
import { formatPrice, parsePriceToCents } from '@/lib/shop/format';
import { renderLegaleContent } from '@/components/LegalContent';
import type { DemoKey } from '@/lib/admin/guide/types';
import { Kbd } from './Rich';
import { markGuideDone } from './progress';

function DemoFrame({
  title,
  hint,
  children,
  className,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn('my-5 overflow-hidden border-primary/20', className)}>
      <div className="flex flex-wrap items-center gap-2 border-b bg-primary/[0.04] px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">
          <Sparkles className="size-3" /> Prova tu
        </span>
        <span className="text-sm font-medium">{title}</span>
        {hint && <span className="w-full text-xs text-muted-foreground sm:ml-auto sm:w-auto">{hint}</span>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </Card>
  );
}

function useIsMac() {
  const [mac, setMac] = React.useState(true);
  React.useEffect(() => setMac(/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)), []);
  return mac;
}

// ── Shell ──────────────────────────────────────────────────────────────────
function ShellDemo() {
  const { collapsed, toggleCollapsed, setCommandOpen, setMobileOpen } = useShell();
  const mac = useIsMac();
  const toggleTheme = () => {
    const next = !document.body.classList.contains('dark');
    document.body.classList.toggle('dark', next);
    document.cookie = `admin_theme=${next ? 'dark' : 'light'}; path=/; max-age=31536000; samesite=lax`;
    markGuideDone('tema');
  };
  return (
    <DemoFrame title="Questi pulsanti agiscono davvero sul gestionale" hint="Puoi annullare premendo di nuovo">
      <div className="grid gap-2 sm:grid-cols-2">
        <Button variant="outline" className="hidden justify-start md:inline-flex" onClick={toggleCollapsed}>
          <PanelLeftClose />
          {collapsed ? 'Espandi il menu laterale' : 'Riduci il menu laterale'}
          <span className="ml-auto text-xs text-muted-foreground">{mac ? '⌘B' : 'Ctrl+B'}</span>
        </Button>
        <Button variant="outline" className="justify-start md:hidden" onClick={() => setMobileOpen(true)}>
          <Menu />
          Apri il menu
        </Button>
        <Button
          variant="outline"
          className="justify-start"
          onClick={() => {
            setCommandOpen(true);
            markGuideDone('ricerca');
          }}
        >
          <Search />
          Apri la ricerca rapida
          <span className="ml-auto text-xs text-muted-foreground">{mac ? '⌘K' : 'Ctrl+K'}</span>
        </Button>
        <Button variant="outline" className="justify-start" onClick={toggleTheme}>
          <Moon />
          Passa al tema chiaro / scuro
        </Button>
      </div>
    </DemoFrame>
  );
}

// ── Shortcuts ──────────────────────────────────────────────────────────────
function ShortcutsDemo() {
  const mac = useIsMac();
  const mod = mac ? '⌘' : 'Ctrl';
  const rows: [React.ReactNode, string][] = [
    [<><Kbd>{mod}</Kbd><Kbd>K</Kbd></>, 'Apre la ricerca rapida (contatti, ordini, prodotti, pagine)'],
    [<><Kbd>{mod}</Kbd><Kbd>B</Kbd></>, 'Riduce o espande il menu laterale (su telefono lo apre)'],
    [<><Kbd>↑</Kbd><Kbd>↓</Kbd></>, 'Nella ricerca rapida: scorre i risultati'],
    [<Kbd key="e">Invio</Kbd>, 'Nella ricerca rapida: apre il risultato evidenziato'],
    [<Kbd key="x">Esc</Kbd>, 'Chiude finestre, menu e ricerca'],
    [<><Kbd>{mod}</Kbd><span className="text-xs text-muted-foreground"> + clic</span></>, 'Su una riga di tabella: la apre in una nuova scheda'],
  ];
  return (
    <DemoFrame title="Scorciatoie da tastiera" hint={mac ? 'Su Mac usa ⌘ (Command)' : 'Su Windows usa Ctrl'}>
      <div className="divide-y rounded-lg border">
        {rows.map(([keys, desc], i) => (
          <div key={i} className="flex flex-col gap-1 px-3 py-2.5 sm:flex-row sm:items-center sm:gap-4">
            <div className="flex w-40 flex-none items-center">{keys}</div>
            <div className="text-sm text-muted-foreground">{desc}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Keyboard className="size-3.5" /> Prova ora: premi <Kbd>{mod}</Kbd>
        <Kbd>K</Kbd> e scrivi <b>#1</b> per cercare l’ordine numero 1.
      </p>
    </DemoFrame>
  );
}

// ── Order flow ─────────────────────────────────────────────────────────────
const FLOW: {
  key: string;
  you: string[];
  auto: string[];
  meaning: string;
}[] = [
  {
    key: 'in_attesa',
    meaning: 'Il cliente ha completato l’ordine sul sito. Il pagamento non è ancora confermato.',
    you: [
      'Apri l’ordine e verifica articoli, indirizzo e note del cliente.',
      'Finché il pagamento con carta non è attivo, contatta il cliente (telefono o email dalla scheda) per confermare e concordare il pagamento.',
      'Quando ricevi il pagamento, porta lo stato su “Pagato”.',
    ],
    auto: [
      'Il cliente viene creato (o aggiornato) da solo in Contatti, con fase “Cliente” e provenienza “Negozio online”.',
      'Nella sua cronologia compare “Ordine #N ricevuto” con il totale.',
      'Il numero accanto a “Ordini” nel menu aumenta: è un ordine da gestire.',
    ],
  },
  {
    key: 'pagato',
    meaning: 'Il pagamento è stato ricevuto. L’ordine va preparato e spedito.',
    you: [
      'Prepara il pacco. Con “Stampa” ottieni la distinta da mettere nella scatola.',
      'Se hai segnato tu “Pagato” a mano, ricordati di scalare i pezzi in Prodotti → Magazzino.',
    ],
    auto: [
      'Quando sarà attivo il pagamento con carta, l’ordine passerà a “Pagato” da solo e le scorte scenderanno automaticamente.',
      'Il cambio di stato viene scritto nella cronologia del cliente.',
    ],
  },
  {
    key: 'spedito',
    meaning: 'Il pacco è partito.',
    you: [
      'Inserisci il codice di tracking del corriere e salva con stato “Spedito”.',
      'Se vuoi, avvisa il cliente con il tracking (Email o WhatsApp dalla scheda contatto).',
    ],
    auto: ['Nella cronologia del cliente compare “Spedito” con il codice di tracking.', 'L’ordine non conta più tra quelli da gestire.'],
  },
  {
    key: 'consegnato',
    meaning: 'Il cliente ha ricevuto l’ordine. È concluso.',
    you: ['Segna “Consegnato” quando il corriere conferma la consegna.'],
    auto: ['L’ordine resta nello storico del cliente e nelle statistiche di vendita.'],
  },
];

function OrderFlowDemo() {
  const [active, setActive] = React.useState(0);
  const step = FLOW[active];
  return (
    <DemoFrame title="Il viaggio di un ordine" hint="Tocca ogni fase per vedere cosa fare">
      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FLOW.map((s, i) => (
          <li key={s.key}>
            <button
              onClick={() => setActive(i)}
              className={cn(
                'flex h-full w-full flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors',
                i === active ? 'border-primary bg-primary/[0.05] shadow-sm' : 'hover:bg-muted/50',
              )}
            >
              <span className="flex w-full items-center gap-2">
                <span
                  className={cn(
                    'flex size-6 flex-none items-center justify-center rounded-full text-xs font-semibold',
                    i <= active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {i + 1}
                </span>
                {i < FLOW.length - 1 && <ArrowRight className="ml-auto hidden size-3.5 text-muted-foreground sm:block" />}
              </span>
              <OrderStatusBadge stato={s.key} />
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-4 rounded-lg border bg-muted/20 p-4">
        <p className="text-sm">{step.meaning}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Hand className="size-4 text-primary" /> Cosa fai tu
            </div>
            <ul className="grid gap-2 text-sm text-muted-foreground">
              {step.you.map((t) => (
                <li key={t} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 flex-none text-primary/70" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Bot className="size-4 text-info" /> Cosa succede da solo
            </div>
            <ul className="grid gap-2 text-sm text-muted-foreground">
              {step.auto.map((t) => (
                <li key={t} className="flex gap-2">
                  <Sparkles className="mt-0.5 size-4 flex-none text-info/70" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
          In qualsiasi momento l’ordine può diventare
          <OrderStatusBadge stato="annullato" /> (non si farà) oppure
          <OrderStatusBadge stato="rimborsato" /> (soldi restituiti).
        </div>
      </div>
    </DemoFrame>
  );
}

// ── Pipeline ───────────────────────────────────────────────────────────────
type DemoCard = { id: string; nome: string; nota: string; stato: string };
const START_CARDS: DemoCard[] = [
  { id: 'a', nome: 'Famiglia Esposito', nota: 'Ha chiesto informazioni al telefono', stato: 'nuovo' },
  { id: 'b', nome: 'Giulia Romano', nota: 'Interessata alla previdenza', stato: 'contattato' },
  { id: 'c', nome: 'Fiori Bianchi Srl', nota: 'Fornitore composizioni', stato: 'preventivo' },
];

function PipelineDemo() {
  const [cards, setCards] = React.useState(START_CARDS);
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string>('Trascina una scheda in un’altra colonna, oppure usa la freccia →.');
  const move = (id: string, stato: string) => {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, stato } : c)));
    const c = cards.find((x) => x.id === id);
    if (c && c.stato !== stato) {
      setInfo(`${c.nome} → ${CONTACT_STAGE[stato].label}: ${CONTACT_STAGE[stato].hint}.`);
      markGuideDone('pipeline');
    }
  };
  const next = (c: DemoCard) => {
    const i = CONTACT_STAGE_KEYS.indexOf(c.stato);
    move(c.id, CONTACT_STAGE_KEYS[Math.min(i + 1, CONTACT_STAGE_KEYS.length - 1)]);
  };
  return (
    <DemoFrame title="Una pipeline di prova" hint="I nomi sono inventati: non viene salvato nulla">
      <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5">
        {CONTACT_STAGE_KEYS.map((stage) => {
          const col = cards.filter((c) => c.stato === stage);
          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragId && move(dragId, stage)}
              className="flex w-56 flex-none snap-start flex-col rounded-lg border bg-muted/30"
            >
              <button
                onClick={() => setInfo(`${CONTACT_STAGE[stage].label}: ${CONTACT_STAGE[stage].hint}.`)}
                className="flex items-center justify-between gap-2 border-b px-3 py-2 text-left"
              >
                <StageBadge stato={stage} />
                <span className="text-xs tabular-nums text-muted-foreground">{col.length}</span>
              </button>
              <div className="grid min-h-[92px] content-start gap-2 p-2">
                {col.map((c) => (
                  <div
                    key={c.id}
                    draggable
                    onDragStart={() => setDragId(c.id)}
                    onDragEnd={() => setDragId(null)}
                    className="cursor-grab rounded-md border bg-card p-2.5 shadow-sm active:cursor-grabbing"
                  >
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{c.nome}</div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">{c.nota}</div>
                      </div>
                      {stage !== CONTACT_STAGE_KEYS[CONTACT_STAGE_KEYS.length - 1] && (
                        <Button size="icon-sm" variant="ghost" className="size-7" onClick={() => next(c)} aria-label="Sposta alla fase successiva">
                          <ArrowRight />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm">
        <MousePointerClick className="size-4 flex-none text-primary" />
        <span className="min-w-0 flex-1">{info}</span>
        <Button size="sm" variant="ghost" onClick={() => { setCards(START_CARDS); setInfo('Ricominciamo: sposta una scheda.'); }}>
          <RotateCcw /> Ricomincia
        </Button>
      </div>
    </DemoFrame>
  );
}

// ── Glossary ───────────────────────────────────────────────────────────────
const ORDER_MEANING: Record<string, string> = {
  in_attesa: 'Ordine ricevuto, pagamento da confermare',
  pagato: 'Pagamento ricevuto, da preparare e spedire',
  spedito: 'Pacco partito (con tracking)',
  consegnato: 'Ricevuto dal cliente, concluso',
  annullato: 'Non verrà evaso',
  rimborsato: 'Pagamento restituito al cliente',
};

function GlossaryDemo() {
  return (
    <DemoFrame title="Che cosa significano i colori" hint="Gli stessi badge che vedi nelle pagine">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stato degli ordini</div>
          <div className="grid gap-2">
            {Object.keys(ORDER_STATUS).map((k) => (
              <div key={k} className="flex items-center gap-3">
                <div className="w-28 flex-none"><OrderStatusBadge stato={k} /></div>
                <span className="text-sm text-muted-foreground">{ORDER_MEANING[k]}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Fasi dei contatti</div>
          <div className="grid gap-2">
            {CONTACT_STAGE_KEYS.map((k) => (
              <div key={k} className="flex items-center gap-3">
                <div className="w-36 flex-none"><StageBadge stato={k} /></div>
                <span className="text-sm text-muted-foreground">{CONTACT_STAGE[k].hint}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attività nella cronologia</div>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.keys(ACTIVITY_TYPE).map((k) => (
              <div key={k} className="flex items-center gap-2.5">
                <ActivityIcon tipo={k} className="size-7" />
                <span className="text-sm">{ACTIVITY_TYPE[k].label}</span>
                {!ACTIVITY_MANUAL_TYPES.includes(k) && (
                  <Badge variant="info" className="ml-auto">automatica</Badge>
                )}
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Magazzino dei prodotti</div>
          <div className="grid gap-2">
            <div className="flex items-center gap-3"><div className="w-36 flex-none"><StockBadge giacenza={12} /></div><span className="text-sm text-muted-foreground">Disponibile</span></div>
            <div className="flex items-center gap-3"><div className="w-36 flex-none"><StockBadge giacenza={2} /></div><span className="text-sm text-muted-foreground">Quasi finito (3 pezzi o meno)</span></div>
            <div className="flex items-center gap-3"><div className="w-36 flex-none"><StockBadge giacenza={0} /></div><span className="text-sm text-muted-foreground">Non acquistabile sul sito</span></div>
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}

// ── Legal editor playground ────────────────────────────────────────────────
const LEGAL_SAMPLE = `## Titolo di una sezione

Un paragrafo normale. Le righe vuote separano i paragrafi.

### Un sottotitolo

- Primo punto dell'elenco
- Secondo punto con **parole in grassetto**

Scrivici a [info@eredicoppola.com](mailto:info@eredicoppola.com) o chiama il [081 571 3888](tel:0815713888).`;

const SNIPPETS: { label: string; text: string }[] = [
  { label: 'Titolo', text: '\n\n## Nuovo titolo\n\n' },
  { label: 'Sottotitolo', text: '\n\n### Nuovo sottotitolo\n\n' },
  { label: 'Elenco', text: '\n\n- Primo punto\n- Secondo punto\n\n' },
  { label: 'Grassetto', text: '**testo importante**' },
  { label: 'Link', text: '[testo del link](https://www.eredicoppola.com)' },
];

function LegalEditorDemo() {
  const [text, setText] = React.useState(LEGAL_SAMPLE);
  const ref = React.useRef<HTMLTextAreaElement>(null);
  const insert = (snippet: string) => {
    const el = ref.current;
    if (!el) return setText((t) => t + snippet);
    const { selectionStart: s, selectionEnd: e } = el;
    const next = text.slice(0, s) + snippet + text.slice(e);
    setText(next);
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = s + snippet.length;
    });
  };
  return (
    <DemoFrame title="Palestra di scrittura" hint="È solo una prova: qui non si salva nulla">
      <div className="mb-2 flex flex-wrap gap-1.5">
        {SNIPPETS.map((s) => (
          <Button key={s.label} size="sm" variant="outline" onClick={() => insert(s.text)}>
            + {s.label}
          </Button>
        ))}
        <Button size="sm" variant="ghost" onClick={() => setText(LEGAL_SAMPLE)}>
          <RotateCcw /> Ripristina esempio
        </Button>
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <Textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[260px] font-mono text-[13px] leading-relaxed"
          aria-label="Testo di prova"
        />
        <div className="min-h-[260px] overflow-auto rounded-md border bg-avorio px-5 py-4">
          <div className="text-[11px] font-medium uppercase tracking-wide text-pietra/50">Anteprima</div>
          <div className="prose-coppola mt-2 [&_h2]:!mt-4 [&_h2]:!font-serif [&_h2]:!text-2xl [&_h2]:!text-pietra [&_h3]:!font-serif [&_h3]:!text-pietra [&_li]:!text-base [&_p]:!text-base">
            {text.trim() ? renderLegaleContent(text) : <p className="italic">Il testo è vuoto.</p>}
          </div>
        </div>
      </div>
    </DemoFrame>
  );
}

// ── Practice table ─────────────────────────────────────────────────────────
type FakeRow = { id: string; nome: string; stato: string; fonte: string; citta: string; ordini: number };
const FAKE: FakeRow[] = [
  { id: '1', nome: 'Anna Ferraro', stato: 'cliente', fonte: 'shop', citta: 'Mugnano di Napoli', ordini: 3 },
  { id: '2', nome: 'Famiglia Esposito', stato: 'nuovo', fonte: 'telefono', citta: 'Napoli', ordini: 0 },
  { id: '3', nome: 'Marco De Luca', stato: 'preventivo', fonte: 'sito', citta: 'Giugliano', ordini: 0 },
  { id: '4', nome: 'Fiori Bianchi Srl', stato: 'contattato', fonte: 'passaparola', citta: 'Calvizzano', ordini: 1 },
  { id: '5', nome: 'Lucia Russo', stato: 'cliente', fonte: 'sede', citta: 'Marano', ordini: 2 },
  { id: '6', nome: 'Paolo Greco', stato: 'perso', fonte: 'social', citta: 'Villaricca', ordini: 0 },
  { id: '7', nome: 'Teresa Costa', stato: 'cliente', fonte: 'shop', citta: 'Napoli', ordini: 1 },
];

function TableDemo() {
  const columns = React.useMemo<ColumnDef<FakeRow, unknown>[]>(
    () => [
      selectColumn<FakeRow>(),
      {
        accessorKey: 'nome',
        header: ({ column }) => <SortHeader column={column} title="Nome" />,
        meta: { label: 'Nome' },
        cell: ({ row }) => <span className="font-medium">{row.original.nome}</span>,
      },
      {
        accessorKey: 'stato',
        header: 'Fase',
        meta: { label: 'Fase' },
        filterFn: facetFilterFn,
        cell: ({ row }) => <StageBadge stato={row.original.stato} />,
      },
      {
        accessorKey: 'fonte',
        header: 'Provenienza',
        meta: { label: 'Provenienza' },
        filterFn: facetFilterFn,
        cell: ({ row }) => CONTACT_SOURCE[row.original.fonte],
      },
      { accessorKey: 'citta', header: 'Città', meta: { label: 'Città' } },
      {
        accessorKey: 'ordini',
        header: ({ column }) => <SortHeader column={column} title="Ordini" />,
        meta: { label: 'Ordini', className: 'text-right' },
        cell: ({ row }) => <span className="tabular-nums">{row.original.ordini}</span>,
      },
    ],
    [],
  );
  return (
    <DemoFrame title="Una tabella di prova" hint="Cerca, filtra, ordina, seleziona: i dati sono inventati">
      <DataTable
        columns={columns}
        data={FAKE}
        searchPlaceholder="Prova a cercare “Napoli”…"
        pageSize={5}
        getRowId={(r) => r.id}
        filters={[
          { columnId: 'stato', title: 'Fase', options: CONTACT_STAGE_KEYS.map((k) => ({ value: k, label: CONTACT_STAGE[k].label })) },
          { columnId: 'fonte', title: 'Provenienza', options: Object.entries(CONTACT_SOURCE).map(([value, label]) => ({ value, label })) },
        ]}
        bulkActions={(rows, clear) => (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              toast.success(`Esempio: qui cambieresti lo stato di ${rows.length} contatti in una volta sola.`);
              markGuideDone('tabelle');
              clear();
            }}
          >
            Cambia stato (prova)
          </Button>
        )}
      />
    </DemoFrame>
  );
}

// ── Price input ────────────────────────────────────────────────────────────
function PriceDemo() {
  const [v, setV] = React.useState('12,50');
  const cents = parsePriceToCents(v);
  return (
    <DemoFrame title="Come scrivere un prezzo" hint="Prova a scrivere un importo">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:w-48">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
          <Input value={v} onChange={(e) => setV(e.target.value)} className="pl-7" inputMode="decimal" aria-label="Prezzo di prova" />
        </div>
        <ArrowRight className="hidden size-4 text-muted-foreground sm:block" />
        <div className="text-sm">
          Verrà salvato come <span className="font-semibold tabular-nums">{formatPrice(cents)}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['12,50', '7.50', '1.250', '1.250,90', '95'].map((x) => (
          <Button key={x} size="sm" variant="secondary" onClick={() => setV(x)}>
            {x}
          </Button>
        ))}
      </div>
    </DemoFrame>
  );
}

// ── Reminders ──────────────────────────────────────────────────────────────
function RemindersDemo() {
  const now = new Date();
  const fmt = (d: Date) => d.toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' });
  const yesterday = new Date(now.getTime() - 86400000);
  const in3 = new Date(now.getTime() + 3 * 86400000);
  const rows = [
    { tipo: 'chiamata', titolo: 'Richiamare la famiglia Esposito', badge: <Badge variant="destructive">Scaduto · {fmt(yesterday)}</Badge>, counts: true },
    { tipo: 'preventivo', titolo: 'Inviare il preventivo a Marco De Luca', badge: <Badge variant="warning">Oggi</Badge>, counts: true },
    { tipo: 'incontro', titolo: 'Appuntamento in sede con Giulia Romano', badge: <Badge variant="muted">{fmt(in3)}</Badge>, counts: false },
  ];
  return (
    <DemoFrame title="Come si leggono i promemoria" hint="Esempi">
      <div className="grid gap-2">
        {rows.map((r) => (
          <div key={r.titolo} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
            <ActivityIcon tipo={r.tipo} />
            <span className="min-w-0 flex-1 text-sm font-medium">{r.titolo}</span>
            {r.badge}
            <span className="w-full text-xs text-muted-foreground sm:w-auto">
              {r.counts ? 'Conta nel numero rosso accanto ad “Attività”' : 'Comparirà nel conteggio il giorno della scadenza'}
            </span>
          </div>
        ))}
      </div>
    </DemoFrame>
  );
}

export function Demo({ demo }: { demo: DemoKey }) {
  switch (demo) {
    case 'shell':
      return <ShellDemo />;
    case 'shortcuts':
      return <ShortcutsDemo />;
    case 'order-flow':
      return <OrderFlowDemo />;
    case 'pipeline':
      return <PipelineDemo />;
    case 'glossary':
      return <GlossaryDemo />;
    case 'legal-editor':
      return <LegalEditorDemo />;
    case 'table':
      return <TableDemo />;
    case 'price':
      return <PriceDemo />;
    case 'reminders':
      return <RemindersDemo />;
    default:
      return null;
  }
}
