import { Plus } from 'lucide-react';

export default function Placeholder({
  title,
  subtitle,
  features,
  actionLabel,
}: {
  title: string;
  subtitle: string;
  features: string[];
  actionLabel?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl text-stone-900">{title}</h1>
          <p className="mt-1 text-stone-500">{subtitle}</p>
        </div>
        {actionLabel && (
          <button
            disabled
            title="Disponibile dopo la connessione a Supabase"
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-[#7F1518] px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            <Plus size={16} />
            {actionLabel}
          </button>
        )}
      </div>

      <div className="mt-8 rounded-xl border border-dashed border-stone-300 bg-white p-8">
        <p className="text-sm font-medium text-stone-700">Funzioni di questa sezione:</p>
        <ul className="mt-3 space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
              <span className="mt-[6px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#7F1518]" />
              {f}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-stone-400">
          L&apos;interfaccia operativa si attiva al collegamento di Supabase.
        </p>
      </div>
    </div>
  );
}
