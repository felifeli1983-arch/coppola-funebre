import { BarChart3, Users2, CalendarDays, Globe } from 'lucide-react';
import { getVisiteStats } from '@/lib/shop/admin-queries';

export const dynamic = 'force-dynamic';

function Stat({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <div className="flex items-center gap-2 text-stone-500">
        <Icon size={16} className="text-[#7F1518]" />
        <span className="truncate text-xs font-medium uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-3xl font-semibold text-stone-900">{value.toLocaleString('it-IT')}</div>
    </div>
  );
}

function RankList({ title, rows }: { title: string; rows: { label: string; n: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.n));
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5">
      <h2 className="mb-3 font-medium text-stone-900">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-stone-400">Nessun dato.</p>
      ) : (
        <ul className="space-y-2.5">
          {rows.map((r) => (
            <li key={r.label}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate text-stone-700" title={r.label}>{r.label}</span>
                <span className="flex-none font-medium text-stone-500">{r.n}</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-[#7F1518]/70" style={{ width: `${(r.n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function Statistiche() {
  const v = await getVisiteStats();

  if (!v) {
    return (
      <div>
        <h1 className="font-serif text-3xl text-stone-900">Statistiche visite</h1>
        <p className="mt-4 text-stone-500">Collega Supabase per vedere le statistiche.</p>
      </div>
    );
  }

  const maxDay = Math.max(1, ...v.perGiorno.map((d) => d.n));

  return (
    <div className="max-w-5xl">
      <h1 className="font-serif text-3xl text-stone-900">Statistiche visite</h1>
      <p className="mt-1 text-stone-500">Ultimi 30 giorni · da dove arrivano i visitatori.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat icon={Users2} label="Visite oggi" value={v.oggi} />
        <Stat icon={CalendarDays} label="Ultimi 7 giorni" value={v.settimana} />
        <Stat icon={BarChart3} label="Totale 30 giorni" value={v.totale} />
      </div>

      {/* Per-day bar chart */}
      <div className="mt-6 rounded-xl border border-stone-200 bg-white p-5">
        <h2 className="mb-4 font-medium text-stone-900">Andamento ultimi 7 giorni</h2>
        <div className="flex items-end justify-between gap-2" style={{ height: 140 }}>
          {v.perGiorno.map((d) => (
            <div key={d.giorno} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-2">
              <span className="text-xs font-medium text-stone-500">{d.n}</span>
              <div
                className="w-full max-w-[44px] rounded-t bg-[#7F1518]/70"
                style={{ height: `${Math.max(4, (d.n / maxDay) * 100)}%` }}
              />
              <span className="text-[10px] text-stone-400">
                {new Date(d.giorno).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <RankList title="Provenienza (referrer)" rows={v.topReferrer.map((r) => ({ label: r.host, n: r.n }))} />
        <RankList title="Sorgente campagna (utm)" rows={v.topSource.map((r) => ({ label: r.source, n: r.n }))} />
        <RankList
          title="Paesi"
          rows={v.topPaese.map((r) => ({ label: r.paese, n: r.n }))}
        />
        <RankList title="Pagine più viste" rows={v.topPagine.map((r) => ({ label: r.path, n: r.n }))} />
      </div>

      <p className="mt-4 flex items-center gap-2 text-xs text-stone-400">
        <Globe size={13} /> Tracciamento anonimo e aggregato, senza cookie di profilazione.
      </p>
    </div>
  );
}
