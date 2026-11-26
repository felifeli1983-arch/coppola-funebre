import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SuccessoPage() {
  return (
    <div className="container-custom max-w-2xl py-12 text-center">
      <CheckCircle2 size={56} className="mx-auto text-green-600" strokeWidth={1.5} />
      <h1 className="section-title mt-6">Ordine confermato</h1>
      <p className="mx-auto mt-4 max-w-md text-pietra-chiaro">
        Grazie. Abbiamo ricevuto il tuo ordine e una email di conferma è in arrivo.
        Ti contatteremo per ogni dettaglio relativo alla spedizione.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/negozio" className="btn-primary">
          Torna allo shop
        </Link>
        <Link
          href="/"
          className="inline-flex items-center border border-pietra/20 px-5 py-2.5 text-sm text-pietra hover:border-bordeaux hover:text-bordeaux"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
