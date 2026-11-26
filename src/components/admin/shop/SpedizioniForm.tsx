'use client';

import * as React from 'react';
import { Calculator, Gift, Truck } from 'lucide-react';
import { ActionForm, SubmitButton } from '@/components/admin/actions';
import { Card, CardContent, CardFooter, CardHeaderRow } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Switch } from '@/components/ui/primitives';
import { salvaSpedizioni } from '@/lib/admin/shop-actions';
import { formatPrice, parsePriceToCents } from '@/lib/shop/format';
import { cn } from '@/lib/utils';

const euro = (c: number) => (c / 100).toFixed(2).replace('.', ',');
const toCents = (raw: string) => {
  const s = raw.replace(/[€\s]/g, '');
  if (/^\d+\.\d{1,2}$/.test(s)) return Math.round(Number(s) * 100);
  const c = parsePriceToCents(s || '0');
  return Number.isFinite(c) ? c : 0;
};

function Money({ id, name, value, onChange }: { id: string; name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
      <Input
        id={id}
        name={name}
        inputMode="decimal"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        pattern="^\d{1,6}([.,]\d{1,2})?$"
        title="Inserisci un importo, es. 7 oppure 7,50"
        className="pl-7 tabular-nums"
      />
    </div>
  );
}

export default function SpedizioniForm({
  initial,
}: {
  initial: { costo_cent: number; soglia_gratis_cent: number; attiva: boolean };
}) {
  const [attiva, setAttiva] = React.useState(initial.attiva);
  const [costo, setCosto] = React.useState(euro(initial.costo_cent));
  const [soglia, setSoglia] = React.useState(euro(initial.soglia_gratis_cent));

  const costoC = toCents(costo);
  const sogliaC = toCents(soglia);
  const calc = (sub: number) => (!attiva ? 0 : sogliaC > 0 && sub >= sogliaC ? 0 : costoC);

  // Example carts around the threshold make the rule easy to read.
  const esempi = Array.from(
    new Set([3000, sogliaC > 0 ? Math.max(100, sogliaC - 500) : 6000, sogliaC > 0 ? sogliaC : 12000, 15000]),
  ).sort((a, b) => a - b);

  return (
    <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
      <Card className="lg:col-span-2">
        <ActionForm action={salvaSpedizioni}>
          <input type="hidden" name="attiva" value={attiva ? 'true' : 'false'} />
          <CardHeaderRow icon={<Truck />} title="Tariffa di spedizione" description="Una tariffa fissa per ordine, con spedizione gratuita oltre una soglia." />
          <CardContent className="grid gap-5">
            <label className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border p-3">
              <span className="min-w-0">
                <span className="block text-sm font-medium">Spedizione a pagamento</span>
                <span className="block text-xs text-muted-foreground">
                  {attiva ? 'Il costo viene aggiunto al totale dell’ordine.' : 'Disattivata: la spedizione è sempre gratuita.'}
                </span>
              </span>
              <Switch checked={attiva} onCheckedChange={setAttiva} aria-label="Spedizione a pagamento" />
            </label>
            <div className={cn('grid gap-4 sm:grid-cols-2', !attiva && 'pointer-events-none opacity-50')}>
              <Field label="Costo di spedizione" htmlFor="costo" hint="Applicato a ogni ordine.">
                <Money id="costo" name="costo" value={costo} onChange={setCosto} />
              </Field>
              <Field label="Gratuita a partire da" htmlFor="soglia" hint="Totale prodotti. Metti 0 per non offrirla mai.">
                <Money id="soglia" name="soglia" value={soglia} onChange={setSoglia} />
              </Field>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton pendingText="Salvataggio…">Salva impostazioni</SubmitButton>
          </CardFooter>
        </ActionForm>
      </Card>

      <Card className="h-fit">
        <CardHeaderRow icon={<Calculator />} title="Anteprima" description="Cosa vedrà il cliente al checkout." />
        <CardContent className="p-0">
          <ul className="divide-y border-t">
            {esempi.map((sub) => {
              const sp = calc(sub);
              return (
                <li key={sub} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span className="text-muted-foreground">
                    Ordine da <span className="font-medium text-foreground tabular-nums">{formatPrice(sub)}</span>
                  </span>
                  {sp === 0 ? (
                    <span className="inline-flex items-center gap-1 font-medium text-success">
                      <Gift className="size-3.5" />
                      Gratuita
                    </span>
                  ) : (
                    <span className="font-medium tabular-nums">+ {formatPrice(sp)}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
