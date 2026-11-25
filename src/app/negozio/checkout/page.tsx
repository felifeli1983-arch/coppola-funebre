'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/shop/CartProvider';
import { formatPrice } from '@/lib/shop/format';

export default function CheckoutPage() {
  const { items, totalCent, clear } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ slug: i.slug, quantita: i.quantita })),
          cliente: Object.fromEntries(fd.entries()),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Errore nel checkout.');
      if (data.url) {
        clear();
        window.location.href = data.url; // Stripe Checkout
      } else {
        setError(data.message || 'Pagamento non ancora disponibile.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore nel checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom max-w-2xl text-center">
        <h1 className="section-title mb-4">Checkout</h1>
        <p className="text-pietra-chiaro">Il carrello è vuoto.</p>
        <Link href="/negozio" className="mt-4 inline-block text-bordeaux hover:underline">
          Vai allo shop
        </Link>
      </div>
    );
  }

  const field =
    'mt-1 w-full border border-pietra/20 bg-white px-3 py-2 text-sm outline-none focus:border-bordeaux';
  const label = 'text-xs font-medium uppercase tracking-wide text-pietra-chiaro';

  return (
    <div className="container-custom max-w-4xl">
      <Link href="/negozio/carrello" className="mb-6 inline-flex items-center gap-2 text-sm text-pietra-chiaro hover:text-bordeaux">
        ← Torna al carrello
      </Link>
      <h1 className="section-title mb-8">Checkout</h1>

      <div className="grid gap-10 lg:grid-cols-5">
        <form onSubmit={onSubmit} className="lg:col-span-3">
          <h2 className="font-serif text-xl text-pietra">Dati e spedizione</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className={label}>Nome e cognome</span>
              <input name="nome" required className={field} />
            </label>
            <label className="block">
              <span className={label}>Email</span>
              <input name="email" type="email" required className={field} />
            </label>
            <label className="block">
              <span className={label}>Telefono</span>
              <input name="telefono" required className={field} />
            </label>
            <label className="block sm:col-span-2">
              <span className={label}>Indirizzo</span>
              <input name="via" required className={field} />
            </label>
            <label className="block">
              <span className={label}>Città</span>
              <input name="citta" required className={field} />
            </label>
            <label className="block">
              <span className={label}>CAP</span>
              <input name="cap" required className={field} />
            </label>
            <label className="block">
              <span className={label}>Provincia</span>
              <input name="provincia" required className={field} />
            </label>
            <label className="block sm:col-span-2">
              <span className={label}>Note per l&apos;ordine (opzionale)</span>
              <textarea name="note" rows={2} className={field} />
            </label>
          </div>

          <div className="mt-6 space-y-3">
            <label className="flex items-start gap-3 text-sm text-pietra-chiaro">
              <input type="checkbox" name="privacy" required className="mt-1 accent-bordeaux" />
              <span>
                Ho letto e accetto l&apos;
                <a href="/privacy-policy" target="_blank" className="text-bordeaux underline">informativa sulla privacy</a>{' '}
                (GDPR Reg. UE 2016/679).
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm text-pietra-chiaro">
              <input type="checkbox" name="condizioni" required className="mt-1 accent-bordeaux" />
              <span>
                Accetto le condizioni di vendita e la{' '}
                <a href="/cookie-policy" target="_blank" className="text-bordeaux underline">cookie policy</a>.
              </span>
            </label>
          </div>

          {error && (
            <div className="mt-5 border border-bordeaux/20 bg-bordeaux/5 px-4 py-3 text-sm text-bordeaux">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary mt-6 disabled:opacity-60">
            {loading ? 'Attendere…' : 'Vai al pagamento'}
          </button>
          <p className="mt-3 text-xs text-pietra/50">
            Pagamento sicuro tramite Stripe. Verrai reindirizzato alla pagina di pagamento.
          </p>
        </form>

        <div className="h-fit rounded-lg border border-pietra/10 bg-white p-6 lg:col-span-2">
          <h2 className="font-serif text-lg text-pietra">Riepilogo</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.slug} className="flex justify-between gap-3 text-pietra-chiaro">
                <span>
                  {i.titolo} × {i.quantita}
                </span>
                <span>{formatPrice(i.prezzo_cent * i.quantita)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-pietra/10 pt-4 text-lg font-medium text-pietra">
            <span>Totale</span>
            <span>{formatPrice(totalCent)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
