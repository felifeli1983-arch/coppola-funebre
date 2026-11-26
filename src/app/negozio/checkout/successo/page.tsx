import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, MessageCircle, Phone } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Ordine ricevuto · Onoranze Funebri Coppola',
  robots: { index: false, follow: false },
};

export default function SuccessoPage({ searchParams }: { searchParams: { stato?: string; session_id?: string } }) {
  // session_id → returned from the online payment page; stato=ricevuto → order
  // recorded, payment to be arranged with the customer.
  const paid = Boolean(searchParams.session_id);

  const steps = paid
    ? [
        { t: 'Pagamento ricevuto', d: 'Il tuo ordine è confermato.' },
        { t: 'Preparazione', d: 'Prepariamo e imballiamo con cura gli articoli.' },
        { t: 'Spedizione', d: 'Ti avviseremo quando il pacco sarà in viaggio.' },
      ]
    : [
        { t: 'Ordine ricevuto', d: 'Abbiamo registrato la tua richiesta.' },
        { t: 'Ti contattiamo', d: 'Ti chiameremo a breve per confermare e concordare il pagamento.' },
        { t: 'Spedizione', d: 'Prepariamo e spediamo gli articoli con cura.' },
      ];

  return (
    <div className="container-custom">
      <div className="mx-auto max-w-2xl border border-pietra/10 bg-white px-6 py-12 text-center sm:px-12 sm:py-16">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-600/10 text-emerald-700">
          <Check size={30} strokeWidth={1.8} />
        </span>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="divider-line" />
          <span className="eyebrow">Grazie</span>
          <span className="divider-line" />
        </div>
        <h1 className="mt-3 font-serif text-4xl leading-tight text-pietra md:text-5xl">
          {paid ? 'Ordine confermato' : 'Ordine ricevuto'}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base font-light leading-relaxed text-pietra-chiaro">
          {paid
            ? 'Grazie per la fiducia. Abbiamo ricevuto il pagamento e ci occupiamo subito del tuo ordine.'
            : 'Grazie per la fiducia. Ti contatteremo a breve per confermare l’ordine e completare il pagamento.'}
        </p>

        <ol className="mx-auto mt-10 grid max-w-lg gap-5 text-left">
          {steps.map((s, i) => (
            <li key={s.t} className="flex items-start gap-4">
              <span
                className={`flex size-8 flex-none items-center justify-center rounded-full text-sm font-medium ${
                  i === 0 ? 'bg-bordeaux text-avorio' : 'border border-pietra/20 text-pietra-chiaro'
                }`}
              >
                {i + 1}
              </span>
              <span>
                <span className="block font-medium text-pietra">{s.t}</span>
                <span className="block text-sm text-pietra-chiaro">{s.d}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="mt-10 border-t border-pietra/10 pt-8">
          <p className="text-sm text-pietra-chiaro">Per qualsiasi necessità siamo a tua disposizione</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <a
              href="tel:+390815713888"
              className="inline-flex min-h-11 items-center gap-2 border border-pietra/20 px-4 text-sm text-pietra transition-colors hover:border-bordeaux hover:text-bordeaux"
            >
              <Phone size={15} /> 081 571 3888
            </a>
            <a
              href="https://wa.me/390815713888"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center gap-2 border border-pietra/20 px-4 text-sm text-pietra transition-colors hover:border-bordeaux hover:text-bordeaux"
            >
              <MessageCircle size={15} /> WhatsApp
            </a>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/negozio" className="btn-primary justify-center">
            Torna al negozio
          </Link>
          <Link href="/" className="btn-outline justify-center">
            Vai alla home
          </Link>
        </div>
      </div>
    </div>
  );
}
