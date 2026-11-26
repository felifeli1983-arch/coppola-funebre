'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRightLeft, GripVertical, MoreHorizontal, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { cn, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CONTACT_STAGE, CONTACT_STAGE_KEYS } from '@/lib/admin/meta';
import { formatPrice } from '@/lib/shop/format';
import { setStatoContatti } from '@/lib/admin/crm-actions';
import type { ContattoConStats } from '@/lib/admin/crm';
import { ContactAvatar, TagChips, nomeContatto } from './shared';

const STAGE_ACCENT: Record<string, string> = {
  nuovo: 'bg-info',
  contattato: 'bg-chart-3',
  preventivo: 'bg-warning',
  cliente: 'bg-success',
  perso: 'bg-muted-foreground/50',
};

export default function PipelineBoard({ contatti }: { contatti: ContattoConStats[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(contatti);
  const [q, setQ] = React.useState('');
  const [dragId, setDragId] = React.useState<string | null>(null);
  const [overStage, setOverStage] = React.useState<string | null>(null);
  const [, start] = React.useTransition();

  React.useEffect(() => setItems(contatti), [contatti]);

  const term = q.trim().toLowerCase();
  const visible = term
    ? items.filter((c) =>
        [c.nome, c.azienda, c.email, c.telefono, ...(c.tags ?? [])].filter(Boolean).join(' ').toLowerCase().includes(term),
      )
    : items;

  const move = (id: string, stato: string) => {
    const current = items.find((c) => c.id === id);
    if (!current || current.stato === stato) return;
    const prev = current.stato;
    setItems((list) => list.map((c) => (c.id === id ? { ...c, stato } : c)));
    start(async () => {
      const fd = new FormData();
      fd.append('ids', id);
      fd.append('stato', stato);
      const res = await setStatoContatti(fd);
      if (!res.ok) {
        setItems((list) => list.map((c) => (c.id === id ? { ...c, stato: prev } : c)));
        toast.error(res.message || 'Non è stato possibile spostare il contatto.');
        return;
      }
      toast.success(`${nomeContatto(current)} → ${CONTACT_STAGE[stato].label}`);
      router.refresh();
    });
  };

  return (
    <div className="grid min-w-0 gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtra contatti…" className="pl-8" />
        </div>
        <p className="hidden text-xs text-muted-foreground lg:block">
          Trascina una scheda in un’altra colonna oppure usa il menu “Sposta in”.
        </p>
      </div>

      <div className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-3 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:mx-0 lg:scroll-px-0 lg:px-0">
        {CONTACT_STAGE_KEYS.map((stage) => {
          const cards = visible.filter((c) => c.stato === stage);
          const isOver = overStage === stage && dragId !== null;
          return (
            <div
              key={stage}
              onDragOver={(e) => {
                if (!dragId) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (overStage !== stage) setOverStage(stage);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) setOverStage(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer.getData('text/plain') || dragId;
                setOverStage(null);
                setDragId(null);
                if (id) move(id, stage);
              }}
              className={cn(
                'flex w-[280px] flex-none snap-start flex-col rounded-xl border bg-muted/40 transition-colors lg:w-auto lg:min-w-[210px] lg:flex-1',
                isOver && 'border-primary/50 bg-primary/[0.05]',
              )}
            >
              <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className={cn('size-2 flex-none rounded-full', STAGE_ACCENT[stage])} />
                  <span className="truncate text-sm font-semibold">{CONTACT_STAGE[stage].label}</span>
                </div>
                <Badge variant="secondary" className="tabular-nums">
                  {cards.length}
                </Badge>
              </div>
              {/* Fixed-height column with its own scroll: the page never grows
                  endlessly, however many contacts sit in one stage. */}
              <div className="flex max-h-[calc(100dvh-17rem)] min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto overscroll-contain px-2 pb-2 [scrollbar-width:thin]">
                {cards.length === 0 && (
                  <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed px-3 py-6 text-center text-xs text-muted-foreground">
                    {isOver ? 'Rilascia qui' : 'Nessun contatto'}
                  </div>
                )}
                {cards.map((c) => (
                  <PipelineCard
                    key={c.id}
                    c={c}
                    dragging={dragId === c.id}
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', c.id);
                      e.dataTransfer.effectAllowed = 'move';
                      setDragId(c.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverStage(null);
                    }}
                    onMove={(s) => move(c.id, s)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {items.length === 0 && (
        <div className="text-center text-sm text-muted-foreground">
          Nessun contatto in rubrica.{' '}
          <Link href="/admin/clienti/nuovo" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
            <UserPlus className="size-3.5" /> Aggiungine uno
          </Link>
        </div>
      )}
    </div>
  );
}

function PipelineCard({
  c,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  c: ContattoConStats;
  dragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onMove: (stato: string) => void;
}) {
  const sub = c.nome && c.azienda ? c.azienda : c.email || c.telefono;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        'group relative min-w-0 cursor-grab rounded-lg border bg-card p-3 shadow-sm transition-shadow hover:shadow-md active:cursor-grabbing',
        dragging && 'opacity-50',
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <ContactAvatar c={c} className="size-8" />
        <div className="min-w-0 flex-1">
          <Link
            href={`/admin/clienti/${c.id}`}
            className="block truncate text-sm font-medium hover:underline"
            draggable={false}
          >
            {nomeContatto(c)}
          </Link>
          {sub && <div className="truncate text-xs text-muted-foreground">{sub}</div>}
        </div>
        <GripVertical className="mt-1 hidden size-4 flex-none text-muted-foreground/40 lg:block" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="-mr-1 -mt-1 size-7 flex-none" aria-label="Sposta in">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="flex items-center gap-1.5">
              <ArrowRightLeft className="size-3.5" /> Sposta in
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {CONTACT_STAGE_KEYS.filter((s) => s !== c.stato).map((s) => (
              <DropdownMenuItem key={s} onSelect={() => onMove(s)}>
                <span className={cn('size-2 rounded-full', STAGE_ACCENT[s])} />
                {CONTACT_STAGE[s].label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {(c.tags?.length > 0 || c.ordini > 0) && (
        <div className="mt-2.5 flex min-w-0 items-center justify-between gap-2">
          <TagChips tags={c.tags} className="min-w-0 flex-1" />
          {c.ordini > 0 && (
            <span className="flex-none text-xs font-medium tabular-nums text-muted-foreground">{formatPrice(c.spesaCent)}</span>
          )}
        </div>
      )}
      <div className="mt-2 text-[11px] text-muted-foreground" suppressHydrationWarning>
        {c.ultima_attivita_at ? `Ultima attività ${timeAgo(c.ultima_attivita_at)}` : `Aggiunto ${timeAgo(c.created_at)}`}
      </div>
    </div>
  );
}
