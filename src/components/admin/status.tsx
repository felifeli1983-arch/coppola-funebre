import {
  CalendarClock,
  FileSignature,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  ShoppingBag,
  StickyNote,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ACTIVITY_TYPE, CONTACT_STAGE, ORDER_STATUS } from '@/lib/admin/meta';

export function OrderStatusBadge({ stato, className }: { stato: string; className?: string }) {
  const m = ORDER_STATUS[stato] ?? { label: stato, variant: 'outline' as const };
  return (
    <Badge variant={m.variant} dot className={className}>
      {m.label}
    </Badge>
  );
}

export function StageBadge({ stato, className }: { stato: string; className?: string }) {
  const m = CONTACT_STAGE[stato] ?? { label: stato, variant: 'outline' as const };
  return (
    <Badge variant={m.variant} dot className={className}>
      {m.label}
    </Badge>
  );
}

export function StockBadge({ giacenza }: { giacenza: number }) {
  if (giacenza <= 0) return <Badge variant="destructive">Esaurito</Badge>;
  if (giacenza <= 3) return <Badge variant="warning">{giacenza} rimasti</Badge>;
  return (
    <Badge variant="muted" className="tabular-nums">
      {giacenza} in magazzino
    </Badge>
  );
}

export const ACTIVITY_ICON: Record<string, LucideIcon> = {
  nota: StickyNote,
  chiamata: Phone,
  email: Mail,
  whatsapp: MessageCircle,
  incontro: Users,
  preventivo: FileSignature,
  ordine: ShoppingBag,
  sistema: RefreshCw,
  promemoria: CalendarClock,
};

export function ActivityIcon({ tipo, className }: { tipo: string; className?: string }) {
  const Icon = ACTIVITY_ICON[tipo] ?? StickyNote;
  const tone = ACTIVITY_TYPE[tipo]?.tone ?? 'bg-muted text-muted-foreground';
  return (
    <span className={cn('flex size-8 flex-none items-center justify-center rounded-full', tone, className)}>
      <Icon className="size-4" />
    </span>
  );
}
