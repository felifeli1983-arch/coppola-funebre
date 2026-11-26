import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe, isStripeConfigured } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSupabaseAdminConfigured } from '@/lib/supabase/env';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Stripe webhook. Confirms payment, upserts the customer into the CRM, links it
 * to the order, and decrements stock. Requires STRIPE_SECRET_KEY,
 * STRIPE_WEBHOOK_SECRET and SUPABASE_SERVICE_ROLE_KEY (service role bypasses RLS
 * — there is no user session on a webhook call).
 */
export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!isStripeConfigured() || !secret) {
    return NextResponse.json({ received: true, note: 'stripe-not-configured' });
  }

  const sig = req.headers.get('stripe-signature');
  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, sig ?? '', secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'invalid signature';
    return NextResponse.json({ error: `Webhook signature failed: ${message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const ordineId = session.metadata?.ordine_id || session.client_reference_id || null;

    if (!isSupabaseAdminConfigured()) {
      // Can't persist without the service role. Acknowledge so Stripe stops retrying.
      return NextResponse.json({ received: true, note: 'service-role-missing' });
    }

    const admin = createAdminClient();
    let clienteData: Record<string, string> = {};
    try {
      clienteData = JSON.parse(session.metadata?.cliente ?? '{}');
    } catch {
      /* ignore */
    }

    // Upsert the customer into the CRM.
    let clienteId: string | null = null;
    const email = session.customer_details?.email || clienteData.email || session.customer_email;
    if (email) {
      const { data: cli } = await admin
        .from('clienti')
        .upsert(
          {
            email: email.toLowerCase(),
            nome: clienteData.nome || session.customer_details?.name || null,
            telefono: clienteData.telefono || session.customer_details?.phone || null,
            indirizzo: {
              via: clienteData.via ?? '',
              citta: clienteData.citta ?? '',
              cap: clienteData.cap ?? '',
              provincia: clienteData.provincia ?? '',
            },
          },
          { onConflict: 'email' },
        )
        .select('id')
        .maybeSingle();
      clienteId = cli?.id ?? null;
    }

    if (ordineId) {
      // Conditional transition: only rows NOT already paid are updated, and the
      // returned rows tell us whether this is the first delivery of the event.
      // Stripe delivers webhooks at-least-once, so stock must decrement once.
      const { data: transitioned } = await admin
        .from('ordini')
        .update({
          stato: 'pagato',
          stripe_payment_intent:
            typeof session.payment_intent === 'string' ? session.payment_intent : null,
          cliente_id: clienteId,
        })
        .eq('id', ordineId)
        .not('stato', 'in', '("pagato","spedito","consegnato","rimborsato")')
        .select('id');

      const firstTransition = (transitioned?.length ?? 0) > 0;
      if (!firstTransition) {
        return NextResponse.json({ received: true, note: 'already-processed' });
      }

      // Decrement stock for each line (only on the first transition).
      const { data: righe } = await admin
        .from('ordini_righe')
        .select('prodotto_id, quantita')
        .eq('ordine_id', ordineId);
      for (const r of righe ?? []) {
        if (!r.prodotto_id) continue;
        const { data: p } = await admin
          .from('prodotti')
          .select('giacenza')
          .eq('id', r.prodotto_id)
          .maybeSingle();
        if (p) {
          await admin
            .from('prodotti')
            .update({ giacenza: Math.max(0, (p.giacenza ?? 0) - r.quantita) })
            .eq('id', r.prodotto_id);
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
