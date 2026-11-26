import Link from 'next/link';
import type { Metadata } from 'next';
import {
  AlertTriangle,
  ArrowRight,
  BellPlus,
  CalendarClock,
  Euro,
  Eye,
  PackagePlus,
  ShoppingBag,
  UserPlus,
  Users,
} from 'lucide-react';
import { getDashboardData } from '@/lib/admin/dashboard';
import { formatPrice } from '@/lib/shop/format';
import { cn, formatDate, initials, timeAgo } from '@/lib/utils';
import { EmptyState, PageHeader, StatCard } from '@/components/admin/kit';
import { Card, CardContent, CardHeaderRow } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/primitives';
import { ActivityIcon, OrderStatusBadge, StageBadge } from '@/components/admin/status';
import { ChartLegend, TrendChart, type ChartSeries } from '@/components/admin/charts';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Dashboard' };

const TZ = 'Europe/Rome';

function saluto(): string {
  const h = Number(new Intl.DateTimeFormat('it-IT', { hour: 'numeric', hour12: false, timeZone: TZ }).format(new Date()));
  if (h < 13) return 'Buongiorno';
  if (h < 18) return 'Buon pomeriggio';
  return 'Buonasera';
}

function trend(curr: number, prev: number, unit: string, empty: string): string {
  if (!prev && !curr) return empty;
  if (!prev) return `In crescita ${unit}`;
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return `Stabile ${unit}`;
  return `${pct > 0 ? '+' : ''}${pct}% ${unit}`;
}

const SALES_SERIES: ChartSeries[] = [
  { key: 'fatturato', label: 'Fatturato', kind: 'area', color: 1, format: 'eur', axis: 'left' },
  { key: 'ordini', label: 'Ordini', kind: 'bar', color: 2, format: 'int', axis: 'right' },
];

export default async function DashboardPage() {
  const d = await getDashboardData();
  const oggi = new Intl.DateTimeFormat('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  })
    .format(new Date())
    .replace(/^./, (c) => c.toUpperCase());
  const now = Date.now();
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return (
    <div className="grid gap-5 lg:gap-6">
      <PageHeader
        title={saluto()}
        description={oggi}
        actions={
          <>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/attivita?nuova=1">
                <BellPlus />
                <span className="hidden sm:inline">Nuova attività</span>
                <span className="sm:hidden">Attività</span>
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/prodotti/nuovo">
                <PackagePlus />
                <span className="hidden sm:inline">Nuovo prodotto</span>
                <span className="sm:hidden">Prodotto</span>
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/admin/clienti/nuovo">
                <UserPlus />
                <span className="hidden sm:inline">Nuovo contatto</span>
                <span className="sm:hidden">Contatto</span>
              </Link>
            </Button>
          </>
        }
        className="mb-0"
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <StatCard
          label="Fatturato · 30 giorni"
          value={formatPrice(d.fatturato30)}
          icon={Euro}
          tone="brand"
          hint={trend(d.fatturato30, d.fatturatoPrev30, 'rispetto ai 30 giorni prima', 'Nessuna vendita nel periodo')}
        />
        <StatCard
          label="Ordini da gestire"
          value={d.ordiniDaGestire}
          icon={ShoppingBag}
          tone={d.ordiniDaGestire > 0 ? 'warning' : 'default'}
          hint={d.ordiniDaGestire > 0 ? 'In attesa o da spedire' : 'Tutto in ordine'}
          href="/admin/ordini"
        />
        <StatCard
          label="Nuovi contatti · 30 giorni"
          value={d.nuoviContatti30}
          icon={Users}
          tone="success"
          hint={`${d.contattiTotali} ${d.contattiTotali === 1 ? 'contatto' : 'contatti'} in totale`}
          href="/admin/clienti"
        />
        <StatCard
          label="Visite al sito · 7 giorni"
          value={d.visite7.toLocaleString('it-IT')}
          icon={Eye}
          hint={trend(d.visite7, d.visitePrev7, 'rispetto alla settimana prima', 'Nessuna visita nel periodo')}
          href="/admin/statistiche"
        />
      </div>

      {/* Chart + reminders */}
      <div className="grid gap-5 lg:grid-cols-12 lg:gap-6">
        <Card className="lg:col-span-8">
          <CardHeaderRow
            title="Vendite e ordini"
            description={`Ultimi 30 giorni · ${d.ordini30} ${d.ordini30 === 1 ? 'ordine' : 'ordini'}`}
            action={<ChartLegend series={SALES_SERIES} />}
            className="flex-col sm:flex-row"
          />
          <CardContent className="px-2 pb-4 sm:px-4">
            <TrendChart
              data={d.serie}
              series={SALES_SERIES}
              height={280}
              emptyTitle="Ancora nessuna vendita"
              emptyDescription="Gli ordini del negozio online compariranno qui giorno per giorno."
            />
          </CardContent>
        </Card>

        <Card className="flex flex-col lg:col-span-4">
          <CardHeaderRow
            title="Promemoria"
            description="Scaduti e nei prossimi 7 giorni"
            icon={<CalendarClock />}
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/attivita">
                  Tutte <ArrowRight />
                </Link>
              </Button>
            }
          />
          <CardContent className="flex-1">
            {d.promemoria.length === 0 ? (
              <EmptyState
                compact
                icon={CalendarClock}
                title="Nessun promemoria"
                description="Programma richiami e scadenze dalla scheda di un contatto."
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/attivita?nuova=1">
                      <BellPlus /> Nuovo promemoria
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="flex flex-col gap-1">
                {d.promemoria.map((p) => {
                  const due = new Date(p.scadenza);
                  const overdue = due.getTime() < now;
                  const today = !overdue && due <= endOfToday;
                  const who = p.cliente?.nome || p.cliente?.azienda || p.cliente?.email || 'Contatto';
                  return (
                    <li key={p.id}>
                      <Link
                        href={p.cliente ? `/admin/clienti/${p.cliente.id}` : '/admin/attivita'}
                        className="flex min-w-0 items-start gap-3 rounded-md p-2 transition-colors hover:bg-muted/60"
                      >
                        <ActivityIcon tipo={p.tipo} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium">{p.titolo || p.testo || 'Promemoria'}</div>
                          <div className="truncate text-xs text-muted-foreground">{who}</div>
                        </div>
                        <span
                          className={cn(
                            'flex-none whitespace-nowrap text-xs font-medium',
                            overdue ? 'text-destructive' : today ? 'text-warning' : 'text-muted-foreground',
                          )}
                        >
                          {overdue ? 'Scaduto' : today ? 'Oggi' : timeAgo(p.scadenza)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lists */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
        <Card className="md:col-span-2 lg:col-span-5">
          <CardHeaderRow
            title="Ultimi ordini"
            icon={<ShoppingBag />}
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/ordini">
                  Tutti <ArrowRight />
                </Link>
              </Button>
            }
          />
          <CardContent>
            {d.ultimiOrdini.length === 0 ? (
              <EmptyState
                compact
                icon={ShoppingBag}
                title="Nessun ordine ancora"
                description="Quando un cliente acquista dal negozio online, l’ordine compare qui."
              />
            ) : (
              <ul className="-mx-2 flex flex-col">
                {d.ultimiOrdini.map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/admin/ordini/${o.id}`}
                      className="flex min-w-0 items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-muted/60"
                    >
                      <span className="w-10 flex-none text-sm font-medium tabular-nums text-muted-foreground">
                        #{o.numero}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{o.nome || o.email}</div>
                        <div className="truncate text-xs text-muted-foreground">{formatDate(o.created_at)}</div>
                      </div>
                      <OrderStatusBadge stato={o.stato} className="hidden sm:inline-flex" />
                      <span className="flex-none text-sm font-medium tabular-nums">{formatPrice(o.totale_cent)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeaderRow
            title="Ultimi contatti"
            icon={<Users />}
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/clienti">
                  Tutti <ArrowRight />
                </Link>
              </Button>
            }
          />
          <CardContent>
            {d.ultimiContatti.length === 0 ? (
              <EmptyState
                compact
                icon={Users}
                title="Nessun contatto"
                description="I clienti del negozio entrano qui automaticamente. Puoi anche aggiungerli a mano."
                action={
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/clienti/nuovo">
                      <UserPlus /> Aggiungi contatto
                    </Link>
                  </Button>
                }
              />
            ) : (
              <ul className="-mx-2 flex flex-col">
                {d.ultimiContatti.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/admin/clienti/${c.id}`}
                      className="flex min-w-0 items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/60"
                    >
                      <Avatar className="size-8">
                        <AvatarFallback>{initials(c.nome || c.azienda, c.email)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">
                          {c.nome || c.azienda || c.email || c.telefono || 'Senza nome'}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">{timeAgo(c.created_at)}</div>
                      </div>
                      <StageBadge stato={c.stato} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeaderRow
            title="Scorte basse"
            icon={<AlertTriangle />}
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/prodotti">
                  Catalogo <ArrowRight />
                </Link>
              </Button>
            }
          />
          <CardContent>
            {d.scorteBasse.length === 0 ? (
              <EmptyState compact icon={PackagePlus} title="Magazzino in ordine" description="Nessun prodotto attivo sotto le 4 unità." />
            ) : (
              <ul className="-mx-2 flex flex-col">
                {d.scorteBasse.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/admin/prodotti/${p.id}`}
                      className="flex min-w-0 items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-muted/60"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm">{p.titolo}</span>
                      <span
                        className={cn(
                          'flex-none rounded-md px-1.5 py-0.5 text-xs font-medium tabular-nums',
                          p.giacenza <= 0 ? 'bg-destructive/10 text-destructive' : 'bg-warning/15 text-warning',
                        )}
                      >
                        {p.giacenza <= 0 ? 'Esaurito' : `${p.giacenza} pz`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
