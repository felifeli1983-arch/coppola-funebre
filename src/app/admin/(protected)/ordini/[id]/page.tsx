import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExternalLink, Mail, MapPin, MessageSquareText, Package, Phone, Printer, Receipt, Settings2, User } from 'lucide-react';
import { PageHeader } from '@/components/admin/kit';
import { OrderStatusBadge } from '@/components/admin/status';
import OrderStepper from '@/components/admin/shop/OrderStepper';
import GestisciOrdine from '@/components/admin/shop/GestisciOrdine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeaderRow } from '@/components/ui/card';
import { Separator } from '@/components/ui/primitives';
import { getOrdineDettaglio } from '@/lib/admin/shop';
import { formatPrice, productImageUrl } from '@/lib/shop/format';
import type { Indirizzo } from '@/lib/shop/types';
import { formatDateTime, timeAgo } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const d = await getOrdineDettaglio(params.id);
  return { title: d ? `Ordine #${d.ordine.numero}` : 'Ordine' };
}

export default async function OrdineDettaglioPage({ params }: { params: { id: string } }) {
  const d = await getOrdineDettaglio(params.id);
  if (!d) notFound();
  const { ordine: o, righe, subtotale, cliente } = d;
  const ind = (o.indirizzo_spedizione ?? {}) as Indirizzo;
  const nome = ind.nome || cliente?.nome || null;
  const telefono = ind.telefono || cliente?.telefono || null;
  const indirizzo = [ind.via, [ind.cap, ind.citta].filter(Boolean).join(' '), ind.provincia, ind.paese]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <PageHeader
        back={{ href: '/admin/ordini', label: 'Ordini' }}
        title={`Ordine #${o.numero}`}
        meta={
          <>
            <OrderStatusBadge stato={o.stato} />
            <span className="text-sm text-muted-foreground">
              {formatDateTime(o.created_at)} · {timeAgo(o.created_at)}
            </span>
          </>
        }
        actions={
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/ordini/${o.id}/stampa`}>
              <Printer />
              Stampa distinta
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="grid min-w-0 content-start gap-4 lg:col-span-2 lg:gap-6">
          <Card className="p-5">
            <OrderStepper stato={o.stato} />
          </Card>

          <Card>
            <CardHeaderRow
              icon={<Package />}
              title="Articoli"
              description={`${righe.reduce((n, r) => n + r.quantita, 0)} articoli`}
            />
            <CardContent className="p-0">
              <ul className="divide-y border-t">
                {righe.map((r) => (
                  <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex size-12 flex-none items-center justify-center overflow-hidden rounded-md border bg-muted">
                      {r.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={productImageUrl(r.cover)} alt="" className="size-full object-cover" />
                      ) : (
                        <Package className="size-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      {r.prodotto_id ? (
                        <Link href={`/admin/prodotti/${r.prodotto_id}`} className="line-clamp-2 break-words font-medium hover:underline">
                          {r.titolo}
                        </Link>
                      ) : (
                        <div className="line-clamp-2 break-words font-medium">{r.titolo}</div>
                      )}
                      <div className="text-sm tabular-nums text-muted-foreground">
                        {r.quantita} × {formatPrice(r.prezzo_cent, o.valuta)}
                      </div>
                    </div>
                    <div className="flex-none font-medium tabular-nums">
                      {formatPrice(r.prezzo_cent * r.quantita, o.valuta)}
                    </div>
                  </li>
                ))}
              </ul>
              <div className="grid gap-2 border-t bg-muted/30 px-5 py-4 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Subtotale</span>
                  <span className="tabular-nums">{formatPrice(subtotale, o.valuta)}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Spedizione</span>
                  <span className="tabular-nums">
                    {o.costo_spedizione_cent ? formatPrice(o.costo_spedizione_cent, o.valuta) : 'Gratuita'}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between gap-4 text-base font-semibold">
                  <span>Totale</span>
                  <span className="tabular-nums">{formatPrice(o.totale_cent, o.valuta)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {o.note && (
            <Card>
              <CardHeaderRow icon={<MessageSquareText />} title="Nota del cliente" />
              <CardContent>
                <p className="whitespace-pre-wrap break-words text-sm">{o.note}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid min-w-0 content-start gap-4 lg:gap-6">
          <Card>
            <CardHeaderRow icon={<Settings2 />} title="Gestisci ordine" />
            <CardContent>
              <GestisciOrdine id={o.id} stato={o.stato} tracking={o.tracking} />
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow icon={<User />} title="Cliente" />
            <CardContent className="grid gap-3 text-sm">
              <div className="break-words font-medium">{nome || 'Cliente senza nome'}</div>
              <a href={`mailto:${o.email}`} className="flex min-w-0 items-center gap-2 text-muted-foreground hover:text-foreground">
                <Mail className="size-4 flex-none" />
                <span className="truncate">{o.email}</span>
              </a>
              {telefono && (
                <a href={`tel:${telefono.replace(/\s+/g, '')}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Phone className="size-4 flex-none" />
                  <span className="truncate">{telefono}</span>
                </a>
              )}
              {cliente && (
                <Button variant="outline" size="sm" asChild className="mt-1 w-full">
                  <Link href={`/admin/clienti/${cliente.id}`}>
                    <ExternalLink />
                    Apri scheda cliente
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeaderRow icon={<MapPin />} title="Indirizzo di spedizione" />
            <CardContent className="text-sm">
              {indirizzo ? (
                <div className="grid gap-0.5 break-words">
                  {nome && <div className="font-medium">{nome}</div>}
                  {ind.via && <div>{ind.via}</div>}
                  <div>{[ind.cap, ind.citta, ind.provincia && `(${ind.provincia})`].filter(Boolean).join(' ')}</div>
                  {ind.paese && <div>{ind.paese}</div>}
                </div>
              ) : (
                <span className="text-muted-foreground">Nessun indirizzo indicato.</span>
              )}
              {o.tracking && (
                <div className="mt-3 rounded-md bg-muted px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Tracciamento: </span>
                  <span className="break-all font-medium">{o.tracking}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {(o.stripe_payment_intent || o.stripe_session_id) && (
            <Card>
              <CardHeaderRow icon={<Receipt />} title="Pagamento" />
              <CardContent className="grid gap-1 text-sm">
                <div className="text-muted-foreground">Riferimento pagamento</div>
                <div className="break-all font-mono text-xs">{o.stripe_payment_intent || o.stripe_session_id}</div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
