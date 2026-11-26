import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Building2,
  CalendarDays,
  Euro,
  History,
  MessageSquarePlus,
  ShoppingBag,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeaderRow } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/primitives';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyState, InfoList, StatCard } from '@/components/admin/kit';
import { OrderStatusBadge, StageBadge } from '@/components/admin/status';
import { QuickActions, StageSelect } from '@/components/admin/crm/ContattoActions';
import { ActivityComposer, ActivityTimeline } from '@/components/admin/crm/Activities';
import { getContatto, nomeContatto, type Contatto } from '@/lib/admin/crm';
import { CONTACT_SOURCE, CONTACT_TYPE, ORDER_REVENUE_STATUSES } from '@/lib/admin/meta';
import { formatPrice } from '@/lib/shop/format';
import { formatDate, initials } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const shortDate = new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'Europe/Rome' });
const monthYear = new Intl.DateTimeFormat('it-IT', { month: 'short', year: 'numeric', timeZone: 'Europe/Rome' });

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const data = await getContatto(params.id);
  return { title: data ? nomeContatto(data.contatto) : 'Contatto' };
}

export default async function ContattoPage({ params }: { params: { id: string } }) {
  const data = await getContatto(params.id);
  if (!data) notFound();
  const { contatto: c, ordini, attivita } = data;
  const ind = c.indirizzo ?? {};
  const speso = ordini
    .filter((o) => ORDER_REVENUE_STATUSES.includes(o.stato))
    .reduce((n, o) => n + (o.totale_cent ?? 0), 0);
  const ultimoOrdine = ordini[0]?.created_at ?? null;
  const aperti = attivita.filter((a) => a.scadenza && !a.completata).length;
  const indirizzo = [ind.via, [ind.cap, ind.citta].filter(Boolean).join(' '), ind.provincia ? `(${ind.provincia})` : '']
    .filter(Boolean)
    .join(', ');
  const name = nomeContatto(c);

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-5">
        <Link href="/admin/clienti" className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          ← Contatti
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <Avatar className="size-14 sm:size-16">
              <AvatarFallback className="text-lg sm:text-xl">{initials(c.nome || c.azienda, c.email)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <h1 className="break-words text-xl font-semibold tracking-tight sm:text-2xl">{name}</h1>
              {c.nome && c.azienda && <div className="truncate text-sm text-muted-foreground">{c.azienda}</div>}
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <StageBadge stato={c.stato} />
                <Badge variant="outline" className="font-normal">
                  {c.tipo === 'azienda' ? (
                    <Building2 className="mr-1 inline align-[-2px]" />
                  ) : (
                    <User className="mr-1 inline align-[-2px]" />
                  )}
                  {CONTACT_TYPE[c.tipo] ?? c.tipo}
                </Badge>
                {c.fonte && (
                  <Badge variant="muted" className="font-normal">
                    {CONTACT_SOURCE[c.fonte] ?? c.fonte}
                  </Badge>
                )}
                {c.tags.map((t) => (
                  <Badge key={t} variant="secondary" className="max-w-[160px] font-normal">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 lg:items-end">
            <QuickActions id={c.id} email={c.email} telefono={c.telefono} />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Stato</span>
              <StageSelect id={c.id} stato={c.stato} />
            </div>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Ordini" value={ordini.length} icon={ShoppingBag} tone="brand" />
        <StatCard label="Totale speso" value={formatPrice(speso)} icon={Euro} tone="success" />
        <StatCard
          label="Ultimo ordine"
          value={ultimoOrdine ? shortDate.format(new Date(ultimoOrdine)) : '—'}
          icon={History}
        />
        <StatCard label="In rubrica dal" value={monthYear.format(new Date(c.created_at))} icon={CalendarDays} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Tabs defaultValue="attivita" className="min-w-0">
          <TabsList>
            <TabsTrigger value="attivita">
              Attività
              {aperti > 0 && (
                <span className="rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">{aperti}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="ordini">Ordini ({ordini.length})</TabsTrigger>
            <TabsTrigger value="dettagli" className="xl:hidden">
              Dettagli
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attivita" className="grid gap-5">
            <Card>
              <CardHeaderRow
                icon={<MessageSquarePlus />}
                title="Registra un’attività"
                description="Annota una chiamata, un incontro o imposta un promemoria."
              />
              <CardContent>
                <ActivityComposer clienteId={c.id} />
              </CardContent>
            </Card>
            <Card>
              <CardHeaderRow title="Cronologia" description={`${attivita.length} ${attivita.length === 1 ? 'voce' : 'voci'}`} />
              <CardContent>
                <ActivityTimeline
                  items={attivita}
                  empty={
                    <EmptyState
                      icon={History}
                      title="Nessuna attività"
                      description="Le note, le chiamate e gli ordini di questo contatto compariranno qui."
                      compact
                    />
                  }
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ordini">
            <Card className="overflow-hidden">
              {ordini.length === 0 ? (
                <EmptyState icon={ShoppingBag} title="Nessun ordine" description="Gli ordini dallo shop vengono collegati automaticamente." compact />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Ordine</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Stato</TableHead>
                      <TableHead className="text-right">Totale</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ordini.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <Link href={`/admin/ordini/${o.id}`} className="font-medium text-primary hover:underline">
                            #{o.numero}
                          </Link>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">{formatDate(o.created_at)}</TableCell>
                        <TableCell>
                          <OrderStatusBadge stato={o.stato} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right tabular-nums">{formatPrice(o.totale_cent)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="dettagli" className="xl:hidden">
            <DetailsCard c={c} indirizzo={indirizzo} />
          </TabsContent>
        </Tabs>

        <div className="hidden min-w-0 xl:block">
          <DetailsCard c={c} indirizzo={indirizzo} />
        </div>
      </div>
    </>
  );
}

function DetailsCard({ c, indirizzo }: { c: Contatto; indirizzo: string }) {
  return (
    <Card>
      <CardHeaderRow title="Dettagli" />
      <CardContent className="grid gap-5">
        <InfoList
          items={[
            { label: 'Email', value: c.email ? <a href={`mailto:${c.email}`} className="hover:underline">{c.email}</a> : null },
            { label: 'Telefono', value: c.telefono ? <a href={`tel:${c.telefono.replace(/\s/g, '')}`} className="hover:underline">{c.telefono}</a> : null },
            { label: 'Indirizzo', value: indirizzo || null },
            ...(c.tipo === 'azienda' ? [{ label: 'Ragione sociale', value: c.azienda }, { label: 'Partita IVA', value: c.partita_iva }] : []),
            { label: 'Codice fiscale', value: c.codice_fiscale },
            { label: 'Fonte', value: c.fonte ? CONTACT_SOURCE[c.fonte] ?? c.fonte : null },
            { label: 'Aggiornato', value: formatDate(c.updated_at) },
          ]}
        />
        {c.note && (
          <div>
            <div className="mb-1.5 text-sm text-muted-foreground">Note</div>
            <p className="whitespace-pre-line break-words rounded-md bg-muted/50 p-3 text-sm">{c.note}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
