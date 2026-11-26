import { HeartHandshake, ShieldCheck, Truck } from 'lucide-react';

const ITEMS = [
  { icon: Truck, title: 'Spedizione in tutta Italia', text: 'Imballaggio accurato e protetto' },
  { icon: ShieldCheck, title: 'Acquisto sicuro', text: 'I tuoi dati sono protetti' },
  { icon: HeartHandshake, title: 'Assistenza dedicata', text: 'Tel. e WhatsApp 081 571 3888' },
];

/** Reassurance strip. `layout="stack"` for narrow columns (summary cards). */
export default function TrustBadges({ layout = 'row' }: { layout?: 'row' | 'stack' }) {
  return (
    <ul
      className={
        layout === 'stack'
          ? 'grid gap-3'
          : 'grid gap-4 sm:grid-cols-3 sm:gap-6'
      }
    >
      {ITEMS.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex min-w-0 items-start gap-3">
          <span className="flex size-9 flex-none items-center justify-center rounded-full bg-oro/10 text-oro">
            <Icon size={17} strokeWidth={1.6} />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-medium text-pietra">{title}</span>
            <span className="block text-xs leading-snug text-pietra-chiaro">{text}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
