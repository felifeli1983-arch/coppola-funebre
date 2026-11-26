import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Cookie, ExternalLink } from 'lucide-react';
import { getLegale, type LegaleTipo } from '@/lib/shop/settings';
import { saveLegale } from '@/lib/admin-actions';

export const dynamic = 'force-dynamic';

const META: Record<LegaleTipo, { title: string; icon: typeof ShieldCheck; publicPath: string; hint: string }> = {
  privacy: {
    title: 'Privacy Policy',
    icon: ShieldCheck,
    publicPath: '/privacy-policy',
    hint: 'Informativa sul trattamento dei dati personali (GDPR). Supporta testo semplice; le righe vuote separano i paragrafi.',
  },
  cookie: {
    title: 'Cookie Policy',
    icon: Cookie,
    publicPath: '/cookie-policy',
    hint: 'Informativa sui cookie e sulle tecnologie di tracciamento utilizzate dal sito.',
  },
};

export default async function LegaleEditor({ params }: { params: { tipo: string } }) {
  if (params.tipo !== 'privacy' && params.tipo !== 'cookie') notFound();
  const tipo = params.tipo as LegaleTipo;
  const meta = META[tipo];
  const Icon = meta.icon;
  const contenuto = await getLegale(tipo);

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={22} className="text-[#7F1518]" />
          <h1 className="font-serif text-3xl text-stone-900">{meta.title}</h1>
        </div>
        <Link
          href={meta.publicPath}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-[#7F1518]"
        >
          Vedi pagina pubblica <ExternalLink size={14} />
        </Link>
      </div>
      <p className="mt-1 text-stone-500">{meta.hint}</p>

      <form action={saveLegale} className="mt-6 space-y-4">
        <input type="hidden" name="tipo" value={tipo} />
        <textarea
          name="contenuto"
          defaultValue={contenuto}
          rows={22}
          placeholder="Scrivi qui il testo dell'informativa…"
          className="w-full rounded-xl border border-stone-300 p-4 font-mono text-sm leading-relaxed outline-none focus:border-[#7F1518]"
        />
        <button className="rounded-md bg-[#7F1518] px-6 py-2.5 text-sm font-medium text-white hover:bg-[#5A0F12]">
          Salva {meta.title}
        </button>
      </form>
    </div>
  );
}
