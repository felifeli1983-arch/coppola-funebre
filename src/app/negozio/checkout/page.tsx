'use client';

import { useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown, Loader2, Lock, Package, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/shop/CartProvider';
import { useShipping } from '@/components/shop/useShipping';
import TrustBadges from '@/components/shop/TrustBadges';
import Breadcrumb from '@/components/shop/Breadcrumb';
import { formatPrice, productImageUrl } from '@/lib/shop/format';

type Field = 'nome' | 'email' | 'telefono' | 'via' | 'citta' | 'cap' | 'provincia' | 'note';
type Values = Record<Field, string>;

const EMPTY: Values = { nome: '', email: '', telefono: '', via: '', citta: '', cap: '', provincia: '', note: '' };
const ORDER: Field[] = ['nome', 'email', 'telefono', 'via', 'citta', 'cap', 'provincia'];

function validate(v: Values, privacy: boolean) {
  const e: Partial<Record<Field | 'privacy', string>> = {};
  if (v.nome.trim().length < 3) e.nome = 'Inserisci nome e cognome.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Inserisci un indirizzo email valido.';
  if (v.telefono.replace(/\D/g, '').length < 6) e.telefono = 'Inserisci un numero di telefono valido.';
  if (v.via.trim().length < 3) e.via = 'Inserisci via e numero civico.';
  if (v.citta.trim().length < 2) e.citta = 'Inserisci la città.';
  if (!/^\d{5}$/.test(v.cap.trim())) e.cap = 'Il CAP è di 5 cifre.';
  if (!/^[A-Za-z]{2}$/.test(v.provincia.trim())) e.provincia = 'Sigla di 2 lettere (es. NA).';
  if (!privacy) e.privacy = 'Per procedere è necessario il consenso.';
  return e;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalCent, clear, hydrated, count } = useCart();
  const ship = useShipping(totalCent);
  const [values, setValues] = useState<Values>(EMPTY);
  const [privacy, setPrivacy] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<Field | 'privacy', boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [placed, setPlaced] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const errors = validate(values, privacy);
  const show = (f: Field | 'privacy') => (submitted || touched[f]) && errors[f];
  const totale = totalCent + ship.costCent;

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [f]: f === 'provincia' ? e.target.value.toUpperCase().slice(0, 2) : e.target.value }));
  const blur = (f: Field | 'privacy') => () => setTouched((t) => ({ ...t, [f]: true }));

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    setError(null);
    const first = [...ORDER, 'privacy' as const].find((f) => errors[f]);
    if (first) {
      const el = formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`);
      el?.focus();
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setLoading(true);
    try {
      const cliente = Object.fromEntries(
        (Object.keys(values) as Field[]).map((k) => [k, values[k].trim()]),
      );
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, quantita: i.quantita })),
          cliente,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Non è stato possibile inviare l’ordine. Riprova.');
      if (data.url) {
        setPlaced(true);
        clear();
        window.location.href = data.url; // secure payment page
        return;
      }
      if (data.ordine) {
        setPlaced(true);
        clear();
        router.replace('/negozio/checkout/successo?stato=ricevuto');
        return;
      }
      throw new Error(data.message || 'Non è stato possibile inviare l’ordine. Riprova.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Non è stato possibile inviare l’ordine. Riprova.');
      setLoading(false);
    }
  };

  if (placed) {
    return (
      <div className="container-custom">
        <div className="mx-auto flex max-w-xl flex-col items-center border border-pietra/10 bg-white px-6 py-16 text-center">
          <Loader2 size={28} className="animate-spin text-bordeaux" />
          <p className="mt-4 font-serif text-2xl text-pietra">Ordine inviato</p>
          <p className="mt-1 text-sm text-pietra-chiaro">Un momento, ti stiamo portando alla conferma…</p>
        </div>
      </div>
    );
  }

  if (!hydrated) {
    return (
      <div className="container-custom">
        <div className="h-96 animate-pulse bg-white/60" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-custom">
        <div className="mx-auto flex max-w-xl flex-col items-center border border-pietra/10 bg-white px-6 py-16 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-avorio-scuro text-pietra/40">
            <ShoppingBag size={26} strokeWidth={1.4} />
          </span>
          <h1 className="mt-5 font-serif text-3xl text-pietra">Il carrello è vuoto</h1>
          <p className="mt-2 text-sm text-pietra-chiaro">Aggiungi qualche articolo per procedere all&apos;ordine.</p>
          <Link href="/negozio" className="btn-primary mt-6">
            Vai al negozio
          </Link>
        </div>
      </div>
    );
  }

  const input = (f: Field) =>
    `mt-1.5 h-12 w-full border bg-white px-3.5 text-base text-pietra outline-none transition-colors placeholder:text-pietra/35 focus:border-bordeaux md:text-sm ${
      show(f) ? 'border-bordeaux bg-bordeaux/[0.03]' : 'border-pietra/20'
    }`;
  const label = 'text-xs font-medium uppercase tracking-wider text-pietra-chiaro';
  const Err = ({ f }: { f: Field | 'privacy' }) =>
    show(f) ? (
      <p id={`${f}-err`} className="mt-1.5 text-xs text-bordeaux">
        {errors[f]}
      </p>
    ) : null;
  const aria = (f: Field) => ({
    'aria-invalid': !!show(f) || undefined,
    'aria-describedby': show(f) ? `${f}-err` : undefined,
  });

  const summary = (
    <>
      <ul className="divide-y divide-pietra/10">
        {items.map((i) => (
          <li key={i.slug} className="flex items-center gap-3 py-3">
            <span className="relative flex size-14 flex-none items-center justify-center bg-avorio-scuro">
              {i.img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={productImageUrl(i.img)} alt="" className="size-full object-cover" />
              ) : (
                <Package size={18} strokeWidth={1.2} className="text-pietra/25" />
              )}
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-pietra px-1 text-[11px] font-medium tabular-nums text-avorio">
                {i.quantita}
              </span>
            </span>
            <span className="line-clamp-2 min-w-0 flex-1 break-words text-sm text-pietra">{i.titolo}</span>
            <span className="whitespace-nowrap text-sm tabular-nums text-pietra">{formatPrice(i.prezzo_cent * i.quantita)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-3 grid gap-2 border-t border-pietra/10 pt-4 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-pietra-chiaro">Subtotale</dt>
          <dd className="whitespace-nowrap tabular-nums">{formatPrice(totalCent)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-pietra-chiaro">Spedizione</dt>
          <dd className="whitespace-nowrap tabular-nums">
            {!ship.ready ? '—' : ship.costCent === 0 ? 'Gratuita' : formatPrice(ship.costCent)}
          </dd>
        </div>
        {ship.missingForFree > 0 && (
          <p className="text-xs text-pietra-chiaro">
            Mancano {formatPrice(ship.missingForFree)} per la spedizione gratuita.
          </p>
        )}
      </dl>
      <div className="mt-4 flex items-baseline justify-between gap-4 border-t border-pietra/10 pt-4">
        <span className="font-medium text-pietra">Totale</span>
        <span className="whitespace-nowrap font-serif text-3xl tabular-nums text-pietra">{formatPrice(totale)}</span>
      </div>
    </>
  );

  return (
    <div className="container-custom">
      <Breadcrumb
        items={[
          { label: 'Negozio', href: '/negozio' },
          { label: 'Carrello', href: '/negozio/carrello' },
          { label: 'Checkout' },
        ]}
      />
      <h1 className="mt-3 font-serif text-3xl text-pietra md:text-4xl">Completa l&apos;ordine</h1>

      {/* Mobile collapsible summary */}
      <div className="mt-6 border border-pietra/10 bg-white lg:hidden">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          aria-expanded={summaryOpen}
          className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left"
        >
          <span className="flex items-center gap-2 text-sm text-pietra">
            <ShoppingBag size={16} className="text-oro" />
            {summaryOpen ? 'Nascondi riepilogo' : 'Mostra riepilogo'}
            <span className="text-pietra-chiaro">({count})</span>
            <ChevronDown size={16} className={`transition-transform ${summaryOpen ? 'rotate-180' : ''}`} />
          </span>
          <span className="font-serif text-xl tabular-nums text-pietra">{formatPrice(totale)}</span>
        </button>
        {summaryOpen && <div className="border-t border-pietra/10 px-4 pb-4">{summary}</div>}
      </div>

      <div className="mt-6 grid items-start gap-8 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_440px]">
        <form ref={formRef} onSubmit={onSubmit} noValidate className="grid min-w-0 gap-6">
          <fieldset className="border border-pietra/10 bg-white p-5 sm:p-6">
            <legend className="sr-only">Contatti</legend>
            <h2 className="flex items-center gap-3 font-serif text-2xl text-pietra">
              <span className="flex size-7 items-center justify-center rounded-full bg-bordeaux font-sans text-xs font-medium text-avorio">1</span>
              Contatti
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className={label}>Nome e cognome</span>
                <input name="nome" autoComplete="name" value={values.nome} onChange={set('nome')} onBlur={blur('nome')} className={input('nome')} {...aria('nome')} />
                <Err f="nome" />
              </label>
              <label className="block">
                <span className={label}>Email</span>
                <input name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set('email')} onBlur={blur('email')} className={input('email')} {...aria('email')} />
                <Err f="email" />
              </label>
              <label className="block">
                <span className={label}>Telefono</span>
                <input name="telefono" type="tel" inputMode="tel" autoComplete="tel" value={values.telefono} onChange={set('telefono')} onBlur={blur('telefono')} className={input('telefono')} {...aria('telefono')} />
                <Err f="telefono" />
              </label>
            </div>
          </fieldset>

          <fieldset className="border border-pietra/10 bg-white p-5 sm:p-6">
            <legend className="sr-only">Indirizzo di spedizione</legend>
            <h2 className="flex items-center gap-3 font-serif text-2xl text-pietra">
              <span className="flex size-7 items-center justify-center rounded-full bg-bordeaux font-sans text-xs font-medium text-avorio">2</span>
              Indirizzo di spedizione
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-6">
              <label className="block sm:col-span-6">
                <span className={label}>Via e numero civico</span>
                <input name="via" autoComplete="street-address" value={values.via} onChange={set('via')} onBlur={blur('via')} className={input('via')} {...aria('via')} />
                <Err f="via" />
              </label>
              <label className="block sm:col-span-3">
                <span className={label}>Città</span>
                <input name="citta" autoComplete="address-level2" value={values.citta} onChange={set('citta')} onBlur={blur('citta')} className={input('citta')} {...aria('citta')} />
                <Err f="citta" />
              </label>
              <label className="block sm:col-span-2">
                <span className={label}>CAP</span>
                <input name="cap" inputMode="numeric" autoComplete="postal-code" maxLength={5} value={values.cap} onChange={set('cap')} onBlur={blur('cap')} className={input('cap')} {...aria('cap')} />
                <Err f="cap" />
              </label>
              <label className="block sm:col-span-1">
                <span className={label}>Prov.</span>
                <input name="provincia" autoComplete="address-level1" placeholder="NA" value={values.provincia} onChange={set('provincia')} onBlur={blur('provincia')} className={input('provincia')} {...aria('provincia')} />
                <Err f="provincia" />
              </label>
            </div>
          </fieldset>

          <fieldset className="border border-pietra/10 bg-white p-5 sm:p-6">
            <legend className="sr-only">Note</legend>
            <h2 className="flex items-center gap-3 font-serif text-2xl text-pietra">
              <span className="flex size-7 items-center justify-center rounded-full bg-bordeaux font-sans text-xs font-medium text-avorio">3</span>
              Note <span className="font-sans text-sm text-pietra-chiaro">(facoltative)</span>
            </h2>
            <label className="mt-5 block">
              <span className="sr-only">Note per l&apos;ordine</span>
              <textarea
                name="note"
                rows={3}
                value={values.note}
                onChange={set('note')}
                placeholder="Indicazioni per la consegna, orari, citofono…"
                className="w-full border border-pietra/20 bg-white px-3.5 py-3 text-base text-pietra outline-none transition-colors placeholder:text-pietra/35 focus:border-bordeaux md:text-sm"
              />
            </label>
          </fieldset>

          <div className="grid gap-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-pietra-chiaro">
              <input
                type="checkbox"
                name="privacy"
                checked={privacy}
                onChange={(e) => setPrivacy(e.target.checked)}
                onBlur={blur('privacy')}
                className="mt-0.5 size-5 flex-none accent-bordeaux"
              />
              <span>
                Ho letto l&apos;
                <a href="/privacy-policy" target="_blank" className="text-bordeaux underline underline-offset-2">
                  informativa sulla privacy
                </a>{' '}
                e acconsento al trattamento dei miei dati per la gestione dell&apos;ordine.
              </span>
            </label>
            <Err f="privacy" />

            {error && (
              <div role="alert" className="border border-bordeaux/25 bg-bordeaux/5 px-4 py-3 text-sm text-bordeaux">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 whitespace-nowrap bg-bordeaux px-6 text-sm font-medium uppercase tracking-wider text-avorio transition-colors hover:bg-bordeaux-dark disabled:opacity-60"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
              {loading ? 'Invio in corso…' : `Conferma l'ordine · ${formatPrice(totale)}`}
            </button>
            <p className="text-center text-xs text-pietra-chiaro">
              Riceverai la conferma dell&apos;ordine e ti contatteremo per ogni dettaglio sulla consegna.
            </p>
            <Link
              href="/negozio/carrello"
              className="inline-flex min-h-10 items-center justify-center gap-2 text-sm text-pietra-chiaro transition-colors hover:text-bordeaux"
            >
              <ArrowLeft size={15} /> Torna al carrello
            </Link>
          </div>
        </form>

        <aside className="hidden lg:sticky lg:top-28 lg:grid lg:gap-4">
          <div className="border border-pietra/10 bg-white p-6">
            <h2 className="font-serif text-2xl text-pietra">Il tuo ordine</h2>
            <div className="mt-2">{summary}</div>
          </div>
          <div className="border border-pietra/10 bg-white/60 p-5">
            <TrustBadges layout="stack" />
          </div>
        </aside>
      </div>
    </div>
  );
}
