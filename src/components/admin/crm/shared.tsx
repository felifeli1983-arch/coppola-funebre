'use client';

import * as React from 'react';
import { CalendarClock } from 'lucide-react';
import { cn, formatDateTime, initials, timeAgo } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/primitives';
import { Badge } from '@/components/ui/badge';

/** Display name for a contact: name → company → email → phone. */
export function nomeContatto(c: {
  nome?: string | null;
  azienda?: string | null;
  email?: string | null;
  telefono?: string | null;
}) {
  return c.nome || c.azienda || c.email || c.telefono || 'Contatto senza nome';
}

export function ContactAvatar({
  c,
  className,
}: {
  c: { nome?: string | null; azienda?: string | null; email?: string | null };
  className?: string;
}) {
  return (
    <Avatar className={cn('size-9', className)}>
      <AvatarFallback>{initials(c.nome || c.azienda, c.email)}</AvatarFallback>
    </Avatar>
  );
}

export function TagChips({
  tags,
  max = 2,
  className,
  nowrap,
}: {
  tags: string[];
  max?: number;
  className?: string;
  nowrap?: boolean;
}) {
  if (!tags?.length) return null;
  const shown = tags.slice(0, max);
  const rest = tags.length - shown.length;
  return (
    <div className={cn('flex min-w-0 items-center gap-1', nowrap ? 'flex-nowrap' : 'flex-wrap', className)}>
      {shown.map((t) => (
        <Badge key={t} variant="outline" className={cn('font-normal', nowrap ? 'max-w-[96px]' : 'max-w-[120px]')}>
          {t}
        </Badge>
      ))}
      {rest > 0 && (
        <Badge variant="muted" className="font-normal">
          +{rest}
        </Badge>
      )}
    </div>
  );
}

export function scadenzaStato(scadenza: string | null, completata: boolean): 'scaduto' | 'oggi' | 'futuro' | null {
  if (!scadenza || completata) return null;
  const d = new Date(scadenza);
  const now = new Date();
  if (d.getTime() < now.getTime()) return 'scaduto';
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  if (d.getTime() <= end.getTime()) return 'oggi';
  return 'futuro';
}

export function ScadenzaBadge({ scadenza, completata }: { scadenza: string | null; completata: boolean }) {
  if (!scadenza) return null;
  const st = scadenzaStato(scadenza, completata);
  const label = formatDateTime(scadenza);
  if (completata) {
    return (
      <Badge variant="muted" className="font-normal">
        <CalendarClock className="mr-1 inline align-[-2px]" />
        <span suppressHydrationWarning>{label}</span>
      </Badge>
    );
  }
  return (
    <Badge variant={st === 'scaduto' ? 'destructive' : st === 'oggi' ? 'warning' : 'info'}>
      <CalendarClock className="mr-1 inline align-[-2px]" />
      <span suppressHydrationWarning>
        {st === 'scaduto' ? 'Scaduto · ' : st === 'oggi' ? 'Oggi · ' : ''}
        {label}
      </span>
    </Badge>
  );
}

/** Relative time ("3 giorni fa") that tolerates server/client clock differences. */
export function TimeAgo({ date, className }: { date: string | null | undefined; className?: string }) {
  return (
    <span className={className} suppressHydrationWarning>
      {timeAgo(date)}
    </span>
  );
}

/** Italian phone → wa.me number (digits only, +39 when missing). */
export function whatsappNumber(tel: string): string {
  let d = tel.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (!d.startsWith('39') || d.length <= 10) d = '39' + d;
  return d.replace(/\D/g, '');
}

/** Local datetime input → ISO string (computed in the browser's time zone). */
export function DateTimeInput({
  name,
  defaultValue,
  className,
  id,
  required,
}: {
  name: string;
  defaultValue?: string | null;
  className?: string;
  id?: string;
  required?: boolean;
}) {
  const toLocal = (iso?: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const p = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };
  const [local, setLocal] = React.useState(toLocal(defaultValue));
  const iso = local ? new Date(local).toISOString() : '';
  return (
    <>
      <input
        id={id}
        type="datetime-local"
        value={local}
        required={required}
        aria-label="Data e ora del promemoria"
        onChange={(e) => setLocal(e.target.value)}
        className={cn(
          'flex h-9 w-full min-w-0 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:border-ring',
          className,
        )}
      />
      <input type="hidden" name={name} value={iso} />
    </>
  );
}
