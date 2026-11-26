'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlarmClock, BellPlus, Check, ChevronLeft, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { EmptyState } from '@/components/admin/kit';
import type { AttivitaConCliente, ContattoLite } from '@/lib/admin/crm';
import { ActivityComposer, ActivityTimeline } from './Activities';
import { ContactAvatar, nomeContatto } from './shared';

type TabKey = 'todo' | 'scadute' | 'oggi' | 'settimana' | 'completate' | 'tutte';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'todo', label: 'Da fare' },
  { key: 'scadute', label: 'Scadute' },
  { key: 'oggi', label: 'Oggi' },
  { key: 'settimana', label: 'Prossimi 7 giorni' },
  { key: 'completate', label: 'Completate' },
  { key: 'tutte', label: 'Tutte' },
];

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dayLabel(d: Date) {
  const today = new Date();
  const diff = Math.round(
    (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
      new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
      86400000,
  );
  if (diff === 0) return 'Oggi';
  if (diff === 1) return 'Domani';
  if (diff === -1) return 'Ieri';
  return new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}

export default function AttivitaView({
  attivita,
  contatti,
  openNew,
}: {
  attivita: AttivitaConCliente[];
  contatti: ContattoLite[];
  openNew: boolean;
}) {
  const router = useRouter();
  const [tab, setTab] = React.useState<TabKey>('todo');
  const [dialog, setDialog] = React.useState(openNew);
  // Time-dependent grouping uses the browser's clock/time zone, so it is
  // computed after mount (avoids server/client mismatches).
  const [nowState, setNow] = React.useState<number | null>(null);
  React.useEffect(() => setNow(Date.now()), [attivita]);
  const now = nowState ?? 0;

  const endToday = React.useMemo(() => {
    const d = new Date(now);
    d.setHours(23, 59, 59, 999);
    return d.getTime();
  }, [now]);
  const startToday = React.useMemo(() => {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, [now]);

  const tasks = attivita.filter((a) => a.scadenza);
  const open = tasks.filter((a) => !a.completata);
  const t = (a: AttivitaConCliente) => new Date(a.scadenza!).getTime();

  const lists: Record<TabKey, AttivitaConCliente[]> = {
    todo: open,
    scadute: open.filter((a) => t(a) < now),
    oggi: open.filter((a) => t(a) >= startToday && t(a) <= endToday),
    settimana: open.filter((a) => t(a) >= now && t(a) <= now + 7 * 86400000),
    completate: tasks.filter((a) => a.completata),
    tutte: attivita,
  };
  const dueCount = open.filter((a) => t(a) <= endToday).length;

  const byScadenza = tab !== 'tutte';
  const current = [...lists[tab]].sort((a, b) => {
    if (!byScadenza) return b.created_at.localeCompare(a.created_at);
    return tab === 'completate' ? t(b) - t(a) : t(a) - t(b);
  });

  const groups: { key: string; label: string; items: AttivitaConCliente[] }[] = [];
  for (const a of current) {
    const d = new Date(byScadenza ? a.scadenza! : a.created_at);
    const k = dayKey(d);
    let g = groups.find((x) => x.key === k);
    if (!g) {
      g = { key: k, label: dayLabel(d), items: [] };
      groups.push(g);
    }
    g.items.push(a);
  }

  const closeDialog = (o: boolean) => {
    setDialog(o);
    if (!o && openNew) router.replace('/admin/attivita');
  };

  return (
    <div className="grid min-w-0 gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <div className="inline-flex h-9 items-center rounded-lg bg-muted p-1 text-muted-foreground">
            {TABS.map((tb) => {
              const n = lists[tb.key].length;
              return (
                <button
                  key={tb.key}
                  type="button"
                  onClick={() => setTab(tb.key)}
                  className={cn(
                    'inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-all',
                    tab === tb.key ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground',
                  )}
                >
                  {tb.label}
                  {tb.key !== 'tutte' && tb.key !== 'completate' && n > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-1.5 text-[10px] font-semibold tabular-nums',
                        tb.key === 'scadute' ? 'bg-destructive text-destructive-foreground' : 'bg-foreground/10',
                      )}
                    >
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        <Button onClick={() => setDialog(true)} className="w-full sm:w-auto">
          <BellPlus />
          Nuova attività
        </Button>
      </div>

      {dueCount > 0 && tab === 'todo' && (
        <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
          <AlarmClock className="size-4 flex-none" />
          <span>
            {dueCount === 1 ? 'Hai 1 promemoria' : `Hai ${dueCount} promemoria`} per oggi o già scaduti.
          </span>
        </div>
      )}

      {nowState === null ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card>
          <EmptyState
            icon={tab === 'completate' ? Check : ListTodo}
            title={
              tab === 'scadute'
                ? 'Nessun promemoria scaduto'
                : tab === 'completate'
                  ? 'Nessuna attività completata'
                  : tab === 'tutte'
                    ? 'Ancora nessuna attività'
                    : 'Niente in programma'
            }
            description={
              tab === 'tutte'
                ? 'Note, chiamate e ordini dei contatti compariranno qui.'
                : 'Crea un promemoria per ricordarti di richiamare un cliente o inviare un preventivo.'
            }
            action={
              <Button variant="outline" onClick={() => setDialog(true)}>
                <BellPlus />
                Nuova attività
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-5">
          {groups.map((g) => (
            <div key={g.key} className="min-w-0">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground first-letter:uppercase">
                {g.label}
              </div>
              <Card>
                <CardContent className="pt-5">
                  <ActivityTimeline items={g.items} showContact />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      <NuovaAttivitaDialog open={dialog} onOpenChange={closeDialog} contatti={contatti} />
    </div>
  );
}

function NuovaAttivitaDialog({
  open,
  onOpenChange,
  contatti,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  contatti: ContattoLite[];
}) {
  const [selected, setSelected] = React.useState<ContattoLite | null>(null);
  React.useEffect(() => {
    if (!open) setSelected(null);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nuova attività</DialogTitle>
          <DialogDescription>
            {selected ? 'Descrivi l’attività e, se serve, imposta un promemoria.' : 'Per quale contatto?'}
          </DialogDescription>
        </DialogHeader>
        {!selected ? (
          <Command className="rounded-lg border">
            <CommandInput placeholder="Cerca un contatto per nome, email o telefono…" autoFocus />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>
                Nessun contatto trovato.{' '}
                <a href="/admin/clienti/nuovo" className="font-medium text-primary hover:underline">
                  Creane uno
                </a>
              </CommandEmpty>
              <CommandGroup>
                {contatti.map((c) => (
                  <CommandItem
                    key={c.id}
                    value={`${nomeContatto(c)} ${c.email ?? ''} ${c.telefono ?? ''} ${c.id}`}
                    onSelect={() => setSelected(c)}
                  >
                    <ContactAvatar c={c} className="size-7" />
                    <span className="min-w-0 flex-1 truncate">{nomeContatto(c)}</span>
                    <span className="hidden max-w-[45%] truncate text-xs text-muted-foreground sm:block">
                      {c.email || c.telefono}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        ) : (
          <div className="grid min-w-0 gap-4">
            <div className="flex min-w-0 items-center gap-3 rounded-lg border bg-muted/40 p-2.5">
              <ContactAvatar c={selected} className="size-8" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{nomeContatto(selected)}</div>
                <div className="truncate text-xs text-muted-foreground">{selected.email || selected.telefono || '—'}</div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
                <ChevronLeft />
                Cambia
              </Button>
            </div>
            <ActivityComposer clienteId={selected.id} autoFocus onDone={() => onOpenChange(false)} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
