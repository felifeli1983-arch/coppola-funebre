'use client';

import * as React from 'react';
import { Trash2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ActionForm, ConfirmAction, SubmitButton } from '@/components/admin/actions';
import { aggiungiAmministratore, cambiaPassword, rimuoviAmministratore } from '@/lib/admin/system-actions';
import PasswordInput from './PasswordInput';

export function AddAdminDialog() {
  const [open, setOpen] = React.useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserPlus /> Aggiungi amministratore
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuovo amministratore</DialogTitle>
          <DialogDescription>
            La persona potrà accedere subito al gestionale con questa email e password. Comunicale le
            credenziali di persona e chiedile di cambiare la password al primo accesso.
          </DialogDescription>
        </DialogHeader>
        <ActionForm action={aggiungiAmministratore} onSuccess={() => setOpen(false)} className="grid gap-4">
          <Field label="Email" htmlFor="new-email" required>
            <Input id="new-email" name="email" type="email" autoComplete="off" required placeholder="nome@eredicoppola.com" />
          </Field>
          <Field label="Password" htmlFor="new-password" required hint="Almeno 8 caratteri">
            <PasswordInput id="new-password" name="password" autoComplete="new-password" minLength={8} required />
          </Field>
          <Field label="Conferma password" htmlFor="new-conferma" required>
            <PasswordInput id="new-conferma" name="conferma" autoComplete="new-password" minLength={8} required />
          </Field>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <SubmitButton pendingText="Creazione…">Aggiungi</SubmitButton>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}

export function RemoveAdminButton({ userId, email }: { userId: string; email: string }) {
  return (
    <ConfirmAction
      action={rimuoviAmministratore}
      data={{ user_id: userId }}
      title="Rimuovere l’accesso?"
      description={
        <>
          <span className="font-medium text-foreground">{email}</span> non potrà più entrare nel gestionale e il
          suo account verrà eliminato.
        </>
      }
      confirmLabel="Rimuovi accesso"
      trigger={
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" aria-label={`Rimuovi ${email}`}>
          <Trash2 />
        </Button>
      }
    />
  );
}

export function PasswordForm() {
  return (
    <ActionForm action={cambiaPassword} resetOnSuccess className="grid gap-4">
      <div className="grid items-start gap-4 sm:grid-cols-2">
        <Field label="Nuova password" htmlFor="my-password" hint="Almeno 8 caratteri">
          <PasswordInput id="my-password" name="password" autoComplete="new-password" minLength={8} required />
        </Field>
        <Field label="Conferma nuova password" htmlFor="my-conferma">
          <PasswordInput id="my-conferma" name="conferma" autoComplete="new-password" minLength={8} required />
        </Field>
      </div>
      <div>
        <SubmitButton pendingText="Aggiornamento…">Aggiorna password</SubmitButton>
      </div>
    </ActionForm>
  );
}
