import Link from 'next/link';
import type { Metadata } from 'next';
import { CalendarDays, Eye, FileText, Globe2, Link2, Megaphone, MonitorSmartphone, Sun, TrendingUp } from 'lucide-react';
import { getVisiteData } from '@/lib/admin/dashboard';
import { cn } from '@/lib/utils';
import { PageHeader, StatCard } from '@/components/admin/kit';
import { Card, CardContent, CardHeaderRow } from '@/components/ui/card';
import { TrendChart } from '@/components/admin/charts';
import RankList from '@/components/admin/system/RankList';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Visite al sito' };

const PERIODI = [7, 30, 90] as const;

const DEVICE_LABEL: Record<string, string> = {
  desktop: 'Computer',
  mobile: 'Smartphone',
  tablet: 'Tablet',
};

let regionNames: Intl.DisplayNames | null = null;
try {
  regionNames = new Intl.DisplayNames(['it'], { type: 'region' });
} catch {
  regionNames = null;
}
function paese(code: string): string {
  if (!/^[A-Z]{2}$/.test(code)) return code;
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

export default async function StatistichePage({
  searchParams,
}: {
  searchParams: { giorni?: string };
}) {
  const giorni = PERIODI.includes(Number(searchParams.giorni) as (typeof PERIODI)[number])
    ? Number(searchParams.giorni)
    : 30;
  const v = await getVisiteData(giorni);

  return (
    <div className="grid gap-5 lg:gap-6">
      <PageHeader
        title="Visite al sito"
        description="Quante persone visitano il sito, da dove arrivano e cosa guardano. Rilevazione anonima, senza cookie."
        className="mb-0"
        actions={
          <div className="inline-flex rounded-lg border bg-muted/40 p-1" role="tablist" aria-label="Periodo">
            {PERIODI.map((p) => (
              <Link
                key={p}
                href={`/admin/statistiche?giorni=${p}`}
                role="tab"
                aria-selected={p === giorni}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  p === giorni
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {p} giorni
              </Link>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <StatCard label={`Visite · ${giorni} giorni`} value={v.totale.toLocaleString('it-IT')} icon={Eye} tone="brand" />
        <StatCard label="Oggi" value={v.oggi.toLocaleString('it-IT')} icon={Sun} />
        <StatCard
          label="Media giornaliera"
          value={v.mediaGiornaliera.toLocaleString('it-IT')}
          icon={TrendingUp}
          hint="Visite al giorno nel periodo"
        />
        <StatCard
          label="Pagine diverse viste"
          value={v.pagineUniche.toLocaleString('it-IT')}
          icon={FileText}
        />
      </div>

      <Card>
        <CardHeaderRow
          title="Andamento delle visite"
          description={`Ultimi ${giorni} giorni`}
          icon={<CalendarDays />}
        />
        <CardContent className="px-2 pb-4 sm:px-4">
          <TrendChart
            data={v.perGiorno}
            series={[{ key: 'visite', label: 'Visite', kind: 'area', color: 1, format: 'int' }]}
            height={280}
            emptyTitle="Nessuna visita nel periodo"
          />
        </CardContent>
      </Card>

      <div className="grid gap-5 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <Card>
          <CardHeaderRow title="Da dove arrivano" description="Siti di provenienza" icon={<Link2 />} />
          <CardContent>
            <RankList items={v.referrer.map((r) => ({ label: r.label, n: r.n }))} total={v.totale} />
          </CardContent>
        </Card>
        <Card>
          <CardHeaderRow title="Pagine più viste" icon={<FileText />} />
          <CardContent>
            <RankList items={v.pagine} total={v.totale} mono />
          </CardContent>
        </Card>
        <Card>
          <CardHeaderRow title="Campagne" description="Link tracciati (UTM)" icon={<Megaphone />} />
          <CardContent>
            <RankList items={v.sorgenti} total={v.totale} />
          </CardContent>
        </Card>
        <Card>
          <CardHeaderRow title="Paesi" icon={<Globe2 />} />
          <CardContent>
            <RankList items={v.paesi.map((p) => ({ label: paese(p.label), n: p.n }))} total={v.totale} />
          </CardContent>
        </Card>
        <Card>
          <CardHeaderRow title="Dispositivi" icon={<MonitorSmartphone />} />
          <CardContent>
            <RankList
              items={v.dispositivi.map((d) => ({ label: DEVICE_LABEL[d.label] ?? d.label, n: d.n }))}
              total={v.totale}
            />
          </CardContent>
        </Card>
      </div>

      {v.troncato && (
        <p className="text-xs text-muted-foreground">
          Il periodo contiene moltissime visite: i dettagli sono calcolati sulle più recenti.
        </p>
      )}
    </div>
  );
}
