import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

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
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: 'Negozio non configurato.' }, { status: 503 });
  }

  // Price & validate server-side from the DB — never trust client prices.
  const supabase = createClient();
  const slugs = items.map((i) => i.slug);
  const { data: prodotti, error } = await supabase
    .from('prodotti')
    .select('slug, titolo, prezzo_cent, valuta, giacenza, attivo')
    .in('slug', slugs)
    .eq('attivo', true);
  if (error) {
    return NextResponse.json({ error: 'Errore nel recupero prodotti.' }, { status: 500 });
  }

  const lineItems = items.map((i) => {
    const p = (prodotti ?? []).find((x) => x.slug === i.slug);
    if (!p) throw new Error(`Prodotto non disponibile: ${i.slug}`);
    if (p.giacenza < i.quantita) throw new Error(`Giacenza insufficiente: ${p.titolo}`);
    return { prodotto: p, quantita: i.quantita };
  });

  // Stripe not connected yet → tell the client gracefully (no payment).
  if (!isStripeConfigured()) {
    return NextResponse.json({
      url: null,
      message:
        'Il pagamento non è ancora attivo: colleghiamo Stripe e il checkout sarà operativo. Il resto del negozio funziona.',
    });
  }

  try {
    const stripe = getStripe();
    const origin = req.headers.get('origin') || new URL(req.url).origin;
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems.map(({ prodotto, quantita }) => ({
        quantity: quantita,
        price_data: {
          currency: (prodotto.valuta || 'EUR').toLowerCase(),
          unit_amount: prodotto.prezzo_cent,
          product_data: { name: prodotto.titolo },
        },
      })),
      customer_email: body.cliente?.email,
      success_url: `${origin}/negozio/checkout/successo?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/negozio/carrello`,
      shipping_address_collection: { allowed_countries: ['IT'] },
      metadata: {
        cliente: JSON.stringify(body.cliente ?? {}),
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Errore nel pagamento.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
