import { cn } from '@/lib/utils';

/** Ranked list with proportional bars; labels truncate, counts never wrap. */
export default function RankList({
  items,
  total,
  empty = 'Nessun dato nel periodo.',
  mono,
}: {
  items: { label: string; n: number; hint?: string }[];
  /** Denominator for percentages (defaults to the sum of items). */
  total?: number;
  empty?: string;
  mono?: boolean;
}) {
  if (!items.length) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(...items.map((i) => i.n), 1);
  const tot = total ?? items.reduce((s, i) => s + i.n, 0);
  return (
    <ul className="grid gap-1.5">
      {items.map((it) => (
        <li key={it.label} className="relative min-w-0 overflow-hidden rounded-md">
          <div
            className="absolute inset-y-0 left-0 rounded-md bg-primary/[0.07]"
            style={{ width: `${Math.max(2, (it.n / max) * 100)}%` }}
          />
          <div className="relative flex min-w-0 items-center gap-3 px-2.5 py-1.5 text-sm">
            <span className={cn('min-w-0 flex-1 truncate', mono && 'font-mono text-[13px]')} title={it.label}>
              {it.label}
              {it.hint && <span className="ml-1.5 text-xs text-muted-foreground">{it.hint}</span>}
            </span>
            <span className="flex-none font-medium tabular-nums">{it.n.toLocaleString('it-IT')}</span>
            <span className="w-10 flex-none text-right text-xs tabular-nums text-muted-foreground">
              {tot ? Math.round((it.n / tot) * 100) : 0}%
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
