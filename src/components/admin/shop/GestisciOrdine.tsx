'use client';

import * as React from 'react';
import { ActionForm, SubmitButton } from '@/components/admin/actions';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ORDER_STATUS, ORDER_STATUS_KEYS } from '@/lib/admin/meta';
import { aggiornaOrdine } from '@/lib/admin/shop-actions';

export default function GestisciOrdine({
  id,
  stato,
  tracking,
}: {
  id: string;
  stato: string;
  tracking: string | null;
}) {
  const [value, setValue] = React.useState(stato);
  React.useEffect(() => setValue(stato), [stato]);

  return (
    <ActionForm action={aggiornaOrdine} className="grid gap-4">
      <input type="hidden" name="id" value={id} />
      <Field label="Stato dell’ordine" htmlFor="stato">
        <Select name="stato" value={value} onValueChange={setValue}>
          <SelectTrigger id="stato">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUS_KEYS.map((k) => (
              <SelectItem key={k} value={k}>
                {ORDER_STATUS[k].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Field
        label="Codice di tracciamento"
        htmlFor="tracking"
        hint={value === 'spedito' ? 'Verrà annotato nella scheda del cliente.' : 'Facoltativo, utile quando l’ordine viene spedito.'}
      >
        <Input id="tracking" name="tracking" defaultValue={tracking ?? ''} placeholder="Es. BRT 1234567890" />
      </Field>
      <SubmitButton className="w-full" pendingText="Salvataggio…">
        Salva modifiche
      </SubmitButton>
    </ActionForm>
  );
}
