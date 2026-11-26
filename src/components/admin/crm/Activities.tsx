'use client';

import * as React from 'react';
import Link from 'next/link';
import { BellPlus, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog';
import { cn, formatDateTime, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, NativeSelect, Textarea } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Checkbox, Hint } from '@/components/ui/primitives';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ActionForm, SubmitButton, useAction } from '@/components/admin/actions';
import { ActivityIcon } from '@/components/admin/status';
import { ACTIVITY_MANUAL_TYPES, ACTIVITY_TYPE } from '@/lib/admin/meta';
import { addAttivita, deleteAttivita, toggleAttivita } from '@/lib/admin/crm-actions';
import type { Attivita, AttivitaConCliente } from '@/lib/admin/crm';
import { DateTimeInput, ScadenzaBadge, nomeContatto } from './shared';

// ── Composer ──────────────────────────────────────────────────────────────

export function ActivityComposer({
  clienteId,
  onDone,
  autoFocus,
  className,
}: {
  clienteId: string;
  onDone?: () => void;
  autoFocus?: boolean;
  className?: string;
}) {
  const [withReminder, setWithReminder] = React.useState(false);
  const [key, setKey] = React.useState(0);
  return (
    <ActionForm
      key={key}
      action={addAttivita}
      onSuccess={() => {
        setWithReminder(false);
        setKey((k) => k + 1);
        onDone?.();
      }}
      className={cn('grid gap-3', className)}
    >
      <input type="hidden" name="cliente_id" value={clienteId} />
      <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)]">
        <Field label="Tipo" htmlFor={`tipo-${clienteId}`}>
          <NativeSelect id={`tipo-${clienteId}`} name="tipo" defaultValue="nota">
            {ACTIVITY_MANUAL_TYPES.map((t) => (
              <option key={t} value={t}>
                {ACTIVITY_TYPE[t].label}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Titolo" htmlFor={`titolo-${clienteId}`}>
          <Input
            id={`titolo-${clienteId}`}
            name="titolo"
            placeholder="Es. Chiamata per il preventivo"
            autoFocus={autoFocus}
            maxLength={200}
          />
        </Field>
      </div>
      <Field label="Dettagli" htmlFor={`testo-${clienteId}`}>
        <Textarea id={`testo-${clienteId}`} name="testo" rows={3} placeholder="Cosa è stato detto o deciso…" />
      </Field>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid min-w-0 gap-2 sm:max-w-xs sm:flex-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={withReminder} onCheckedChange={(v) => setWithReminder(!!v)} />
            Imposta un promemoria
          </label>
          {withReminder && (
            <>
              <input type="hidden" name="promemoria" value="1" />
              <DateTimeInput name="scadenza" required />
            </>
          )}
        </div>
        <SubmitButton pendingText="Salvataggio…" className="sm:w-auto">
          <BellPlus />
          {withReminder ? 'Aggiungi promemoria' : 'Registra attività'}
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

// ── Timeline item ─────────────────────────────────────────────────────────

export function ActivityItem({
  a,
  showContact,
  isLast,
}: {
  a: Attivita | AttivitaConCliente;
  showContact?: boolean;
  isLast?: boolean;
}) {
  const { run, pending } = useAction();
  const [done, setDone] = React.useState(a.completata);
  React.useEffect(() => setDone(a.completata), [a.completata]);
  const automatic = a.tipo === 'ordine' || a.tipo === 'sistema';
  const cliente = 'cliente' in a ? a.cliente : null;

  return (
    <li className={cn('relative flex min-w-0 gap-3', isLast ? 'pb-0' : 'pb-5')}>
      {!isLast && <span className="absolute bottom-0 left-4 top-9 w-px bg-border" aria-hidden />}
      <ActivityIcon tipo={a.tipo} className={cn(done && a.scadenza && 'opacity-50')} />
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className={cn('break-words text-sm font-medium', done && a.scadenza && 'text-muted-foreground line-through')}>
              {a.titolo || ACTIVITY_TYPE[a.tipo]?.label || 'Attività'}
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span>{ACTIVITY_TYPE[a.tipo]?.label ?? a.tipo}</span>
              <span aria-hidden>·</span>
              <Hint label={formatDateTime(a.created_at)}>
                <span suppressHydrationWarning>{timeAgo(a.created_at)}</span>
              </Hint>
              {a.autore && (
                <>
                  <span aria-hidden>·</span>
                  <span className="max-w-[180px] truncate">{a.autore === 'Sistema' ? 'Automatico' : a.autore}</span>
                </>
              )}
              {showContact && cliente && (
                <>
                  <span aria-hidden>·</span>
                  <Link href={`/admin/clienti/${cliente.id}`} className="max-w-[200px] truncate font-medium text-foreground hover:underline">
                    {nomeContatto(cliente)}
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-none items-center gap-1">
            {a.scadenza && (
              <Hint label={done ? 'Riapri' : 'Segna come fatto'}>
                <span className="flex size-8 items-center justify-center">
                  <Checkbox
                    checked={done}
                    disabled={pending}
                    aria-label="Completato"
                    onCheckedChange={async (v) => {
                      setDone(!!v);
                      const good = await run(toggleAttivita, { id: a.id, completata: !!v });
                      if (!good) setDone(!v);
                    }}
                  />
                </span>
              </Hint>
            )}
            {!automatic && <ActivityMenu id={a.id} />}
          </div>
        </div>
        {a.testo && (
          <p className="mt-1.5 line-clamp-4 whitespace-pre-line break-words text-sm text-muted-foreground">{a.testo}</p>
        )}
        {a.ordine_id && (
          <Link href={`/admin/ordini/${a.ordine_id}`} className="mt-1.5 inline-block text-xs font-medium text-primary hover:underline">
            Apri l’ordine →
          </Link>
        )}
        {a.scadenza && (
          <div className="mt-2">
            <ScadenzaBadge scadenza={a.scadenza} completata={done} />
          </div>
        )}
      </div>
    </li>
  );
}

function ActivityMenu({ id }: { id: string }) {
  const [confirm, setConfirm] = React.useState(false);
  const { run, pending } = useAction();
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label="Azioni">
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem destructive onSelect={() => setConfirm(true)}>
            <Trash2 /> Elimina
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questa attività?</AlertDialogTitle>
            <AlertDialogDescription>L’operazione non si può annullare.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              destructive
              disabled={pending}
              onClick={async (e) => {
                e.preventDefault();
                const good = await run(deleteAttivita, { id });
                if (good) setConfirm(false);
              }}
            >
              {pending && <Loader2 className="animate-spin" />}
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function ActivityTimeline({
  items,
  showContact,
  empty,
  pageSize = 15,
}: {
  items: (Attivita | AttivitaConCliente)[];
  showContact?: boolean;
  empty?: React.ReactNode;
  /** Entries shown at first and added by each "Mostra altre" click. */
  pageSize?: number;
}) {
  const [visible, setVisible] = React.useState(pageSize);
  if (!items.length) return <>{empty ?? null}</>;
  const shown = items.slice(0, visible);
  const rest = items.length - shown.length;
  return (
    <>
      <ul className="min-w-0">
        {shown.map((a, i) => (
          <ActivityItem key={a.id} a={a} showContact={showContact} isLast={i === shown.length - 1 && rest === 0} />
        ))}
      </ul>
      <ShowMore rest={rest} step={pageSize} onMore={() => setVisible((v) => v + pageSize)} />
    </>
  );
}

/** "Mostra altre" button for long lists (avoids endless pages and nested scroll). */
export function ShowMore({ rest, step, onMore }: { rest: number; step: number; onMore: () => void }) {
  if (rest <= 0) return null;
  return (
    <div className="flex justify-center pt-3">
      <Button variant="outline" size="sm" onClick={onMore}>
        Mostra altre {Math.min(step, rest)}
        <span className="text-muted-foreground">· ne restano {rest}</span>
      </Button>
    </div>
  );
}
