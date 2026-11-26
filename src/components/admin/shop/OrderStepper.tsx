import { Check, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ORDER_STATUS } from '@/lib/admin/meta';

const STEPS = ['in_attesa', 'pagato', 'spedito', 'consegnato'] as const;
const LABELS: Record<string, string> = {
  in_attesa: 'Ricevuto',
  pagato: 'Pagato',
  spedito: 'Spedito',
  consegnato: 'Consegnato',
};

export default function OrderStepper({ stato }: { stato: string }) {
  const step = ORDER_STATUS[stato]?.step ?? 0;
  if (step < 0) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
        <AlertTriangle className="mt-0.5 size-4 flex-none text-destructive" />
        <div>
          <div className="font-medium">Ordine {ORDER_STATUS[stato]?.label.toLowerCase()}</div>
          <div className="text-muted-foreground">
            Questo ordine non è più attivo. Puoi riattivarlo cambiando lo stato qui accanto.
          </div>
        </div>
      </div>
    );
  }
  return (
    <ol className="grid grid-cols-4 gap-1">
      {STEPS.map((s, i) => {
        // Completed up to the current status; the next step is highlighted.
        const done = i <= step;
        const current = i === step + 1;
        return (
          <li key={s} className="min-w-0">
            <div className="flex items-center">
              <span
                className={cn(
                  'flex size-7 flex-none items-center justify-center rounded-full border-2 text-xs font-semibold',
                  done && 'border-primary bg-primary text-primary-foreground',
                  current && 'border-primary bg-background text-primary',
                  !done && !current && 'border-border bg-background text-muted-foreground',
                )}
              >
                {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
              </span>
              {i < STEPS.length - 1 && (
                <span className={cn('mx-1 h-0.5 flex-1 rounded-full', i < step ? 'bg-primary' : 'bg-border')} />
              )}
            </div>
            <div
              className={cn(
                'mt-1.5 truncate text-xs',
                done || current ? 'font-medium text-foreground' : 'text-muted-foreground',
              )}
            >
              {LABELS[s]}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
