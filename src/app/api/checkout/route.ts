import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { getSpedizione, calcolaSpedizione } from '@/lib/shop/settings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Body = {
  items?: { slug: string; quantita: number }[];
  cliente?: Record<string, string>;
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 });
  }

  const items = (body.items ?? []).filter((i) => i?.slug && i.quantita > 0);
  if (items.length === 0) {
    return NextResponse.json({ error: 'Carrello vuoto.' }, { status: 400 });
  }
  const c = body.cliente ?? {};
  if (!c.email || !c.nome) {
    return NextResponse.json({ error: 'Dati del cliente mancanti.' }, { status: 400 });
  }
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Negozio non configurato.' }, { status: 503 });
  }

  // Price & validate server-side from the DB — never trust client prices.
  const supabase = createClient();
  const slugs = items.map((i) => i.slug);
  const { data: prodotti, error } = await supabase
    .from('prodotti')
    .select('id, slug, titolo, prezzo_cent, valuta, giacenza, attivo')
    .in('slug', slugs)
    .eq('attivo', true);
  if (error) {
    return NextResponse.json({ error: 'Errore nel recupero prodotti.' }, { status: 500 });
  }

  let lineItems: { prodotto: NonNullable<typeof prodotti>[number]; quantita: number }[];
  try {
    lineItems = items.map((i) => {
      const p = (prodotti ?? []).find((x) => x.slug === i.slug);
      if (!p) throw new Error(`Prodotto non disponibile: ${i.slug}`);
      if (p.giacenza < i.quantita) throw new Error(`Giacenza insufficiente: ${p.titolo}`);
      return { prodotto: p, quantita: i.quantita };
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Prodotto non disponibile.' },
      { status: 409 },
    );
  }

  const valuta = (lineItems[0].prodotto.valuta || 'EUR').toUpperCase();
  const subtotale = lineItems.reduce((n, { prodotto, quantita }) => n + prodotto.prezzo_cent * quantita, 0);
  const sp = await getSpedizione();
  const spedizioneCent = calcolaSpedizione(subtotale, sp);
  const totale = subtotale + spedizioneCent;

  const ordineId = randomUUID();
  const indirizzo = {
    nome: c.nome ?? '',
    via: c.via ?? '',
    citta: c.citta ?? '',
    cap: c.cap ?? '',
    provincia: c.provincia ?? '',
    telefono: c.telefono ?? '',
  };
  // Compact customer payload for Stripe metadata (per-value 500-char limit;
  // excludes the free-text note and consent checkboxes).
  const clienteMeta = JSON.stringify({
    nome: (c.nome ?? '').slice(0, 80),
    email: (c.email ?? '').slice(0, 120),
    telefono: (c.telefono ?? '').slice(0, 40),
    via: (c.via ?? '').slice(0, 120),
    citta: (c.citta ?? '').slice(0, 60),
    cap: (c.cap ?? '').slice(0, 10),
    provincia: (c.provincia ?? '').slice(0, 40),
  }).slice(0, 480);

  // Create the Stripe session first (if configured) so we can store its id on
  // the order in a single INSERT (anon has no UPDATE on ordini).
  let stripeSessionId: string | null = null;
  let checkoutUrl: string | null = null;
  if (isStripeConfigured()) {
    try {
      const stripe = getStripe();
      const origin = req.headers.get('origin') || new URL(req.url).origin;
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems.map(({ prodotto, quantita }) => ({
          quantity: quantita,
          price_data: {
            currency: valuta.toLowerCase(),
            unit_amount: prodotto.prezzo_cent,
            product_data: { name: prodotto.titolo },
          },
        })),
        customer_email: c.email,
        client_reference_id: ordineId,
        success_url: `${origin}/negozio/checkout/successo?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/negozio/carrello`,
        shipping_address_collection: { allowed_countries: ['IT'] },
        ...(spedizioneCent > 0
          ? {
              shipping_options: [
                {
                  shipping_rate_data: {
                    type: 'fixed_amount' as const,
                    display_name: 'Spedizione',
                    fixed_amount: { amount: spedizioneCent, currency: valuta.toLowerCase() },
                  },
                },
              ],
            }
          : {}),
        metadata: { ordine_id: ordineId, cliente: clienteMeta },
      });
      stripeSessionId = session.id;
      checkoutUrl = session.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Errore nel pagamento.';
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // Persist the order (status "in_attesa"). The Stripe webhook flips it to
  // "pagato" and decrements stock once payment succeeds.
  const { error: ordErr } = await supabase.from('ordini').insert({
    id: ordineId,
    email: c.email,
    stato: 'in_attesa',
    totale_cent: totale,
    valuta,
    costo_spedizione_cent: spedizioneCent,
    indirizzo_spedizione: indirizzo,
    metodo_spedizione: 'standard',
    note: c.note || null,
    stripe_session_id: stripeSessionId,
  });
  if (ordErr) {
    return NextResponse.json({ error: 'Impossibile registrare l’ordine.' }, { status: 500 });
  }
  const { error: righeErr } = await supabase.from('ordini_righe').insert(
    lineItems.map(({ prodotto, quantita }) => ({
      ordine_id: ordineId,
      prodotto_id: prodotto.id,
      titolo: prodotto.titolo,
      prezzo_cent: prodotto.prezzo_cent,
      quantita,
    })),
  );
  if (righeErr) {
    // The order header exists but has no lines — remove it so we never ship a
    // customer to payment for an unrecoverable order (anon has no UPDATE path).
    await supabase.from('ordini').delete().eq('id', ordineId);
    return NextResponse.json({ error: 'Impossibile registrare le righe dell’ordine.' }, { status: 500 });
  }

  if (checkoutUrl) {
    return NextResponse.json({ url: checkoutUrl });
  }
  // Stripe not connected yet: order is recorded, payment will be enabled later.
  return NextResponse.json({
    url: null,
    ordine: ordineId,
    message:
      'Ordine registrato. Il pagamento online non è ancora attivo: ti contatteremo per completare l’ordine. (Stripe verrà collegato a breve.)',
  });
}
