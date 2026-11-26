import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/admin/kit';
import PrintButton from '@/components/admin/shop/PrintButton';
import { getOrdineDettaglio } from '@/lib/admin/shop';
import { getNegozio } from '@/lib/shop/settings';
import { formatPrice } from '@/lib/shop/format';
import { ORDER_STATUS } from '@/lib/admin/meta';
import type { Indirizzo } from '@/lib/shop/types';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Distinta ordine' };

// While printing, hide the admin chrome (sidebar, top bar, toasts) and keep
// only the slip. Scoped to this page: the <style> exists only while mounted.
const PRINT_CSS = `
@media print {
  @page { margin: 14mm; }
  body.admin-root aside, body.admin-root header, [data-sonner-toaster], [data-print-hide] { display: none !important; }
  body.admin-root main { max-width: none !important; padding: 0 !important; }
  body.admin-root { background: #fff !important; }
  .print-slip { border: 0 !important; box-shadow: none !important; padding: 0 !important; }
}`;

export default async function StampaOrdinePage({ params }: { params: { id: string } }) {
  const [d, negozio] = await Promise.all([getOrdineDettaglio(params.id), getNegozio()]);
  if (!d) notFound();
  const { ordine: o, righe, subtotale } = d;
  const ind = (o.indirizzo_spedizione ?? {}) as Indirizzo;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />
      <div data-print-hide>
        <PageHeader
          back={{ href: `/admin/ordini/${o.id}`, label: `Ordine #${o.numero}` }}
          title="Distinta di spedizione"
          description="Anteprima del documento da stampare e inserire nel pacco."
          actions={<PrintButton />}
        />
      </div>

      <div className="print-slip mx-auto max-w-3xl rounded-xl border bg-white p-6 text-zinc-900 shadow-sm sm:p-10">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <div className="min-w-0">
            <div className="font-serif text-2xl font-semibold">{negozio.nome}</div>
            <div className="mt-1 text-sm text-zinc-600">
              {negozio.telefono}
              {negozio.email && <> · {negozio.email}</>}
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-xs uppercase tracking-wider text-zinc-500">Ordine</div>
            <div className="text-2xl font-semibold tabular-nums">#{o.numero}</div>
            <div className="text-sm text-zinc-600">{formatDateTime(o.created_at)}</div>
            <div className="text-sm text-zinc-600">{ORDER_STATUS[o.stato]?.label ?? o.stato}</div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="min-w-0">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Destinatario</div>
            <div className="break-words text-sm leading-relaxed">
              {ind.nome && <div className="font-medium">{ind.nome}</div>}
              {ind.via && <div>{ind.via}</div>}
              <div>{[ind.cap, ind.citta, ind.provincia && `(${ind.provincia})`].filter(Boolean).join(' ')}</div>
              {ind.telefono && <div>Tel. {ind.telefono}</div>}
              <div>{o.email}</div>
            </div>
          </div>
          {o.tracking && (
            <div className="min-w-0">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Tracciamento</div>
              <div className="break-all text-sm">{o.tracking}</div>
            </div>
          )}
        </div>

        <table className="mt-8 w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-300 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="py-2 font-semibold">Articolo</th>
              <th className="py-2 text-center font-semibold">Q.tà</th>
              <th className="hidden py-2 text-right font-semibold sm:table-cell">Prezzo</th>
              <th className="py-2 text-right font-semibold">Totale</th>
            </tr>
          </thead>
          <tbody>
            {righe.map((r) => (
              <tr key={r.id} className="border-b border-zinc-200 align-top">
                <td className="break-words py-2.5 pr-3">{r.titolo}</td>
                <td className="py-2.5 text-center tabular-nums">{r.quantita}</td>
                <td className="hidden py-2.5 text-right tabular-nums sm:table-cell">{formatPrice(r.prezzo_cent, o.valuta)}</td>
                <td className="py-2.5 text-right tabular-nums">{formatPrice(r.prezzo_cent * r.quantita, o.valuta)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-4 grid max-w-xs gap-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-zinc-600">Subtotale</span>
            <span className="tabular-nums">{formatPrice(subtotale, o.valuta)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-zinc-600">Spedizione</span>
            <span className="tabular-nums">
              {o.costo_spedizione_cent ? formatPrice(o.costo_spedizione_cent, o.valuta) : 'Gratuita'}
            </span>
          </div>
          <div className="flex justify-between gap-4 border-t border-zinc-300 pt-1.5 text-base font-semibold">
            <span>Totale</span>
            <span className="tabular-nums">{formatPrice(o.totale_cent, o.valuta)}</span>
          </div>
        </div>

        {o.note && (
          <div className="mt-8 rounded-md bg-zinc-100 p-3 text-sm">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500">Nota del cliente</div>
            <p className="whitespace-pre-wrap break-words">{o.note}</p>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-zinc-500">Grazie per aver scelto {negozio.nome}.</p>
      </div>
    </>
  );
}
