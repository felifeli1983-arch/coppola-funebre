'use client';

import * as React from 'react';
import Link from 'next/link';
import { Loader2, Mail, MessageCircle, MoreHorizontal, Pencil, Phone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog';
import { Hint } from '@/components/ui/primitives';
import { useAction } from '@/components/admin/actions';
import { CONTACT_STAGE, CONTACT_STAGE_KEYS } from '@/lib/admin/meta';
import { deleteContatti, setStatoContatti } from '@/lib/admin/crm-actions';
import { whatsappNumber } from './shared';

export function QuickActions({
  id,
  email,
  telefono,
}: {
  id: string;
  email: string | null;
  telefono: string | null;
}) {
  const [confirm, setConfirm] = React.useState(false);
  const { run, pending } = useAction();

  return (
    <div className="flex flex-wrap items-center gap-2">
      {telefono && (
        <Button variant="outline" size="sm" asChild>
          <a href={`tel:${telefono.replace(/\s/g, '')}`}>
            <Phone />
            Chiama
          </a>
        </Button>
      )}
      {telefono && (
        <Button variant="outline" size="sm" asChild>
          <a href={`https://wa.me/${whatsappNumber(telefono)}`} target="_blank" rel="noreferrer">
            <MessageCircle />
            WhatsApp
          </a>
        </Button>
      )}
      {email && (
        <Button variant="outline" size="sm" asChild>
          <a href={`mailto:${email}`}>
            <Mail />
            Email
          </a>
        </Button>
      )}
      <Button size="sm" asChild>
        <Link href={`/admin/clienti/${id}/modifica`}>
          <Pencil />
          Modifica
        </Link>
      </Button>
      <DropdownMenu>
        <Hint label="Altre azioni">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon-sm" aria-label="Altre azioni">
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
        </Hint>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/clienti/${id}/modifica`}>
              <Pencil /> Modifica dati
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => setConfirm(true)}>
            <Trash2 /> Elimina contatto
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare questo contatto?</AlertDialogTitle>
            <AlertDialogDescription>
              Verranno eliminati anche le note e i promemoria collegati. Gli ordini restano nello storico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              destructive
              disabled={pending}
              onClick={async (e) => {
                e.preventDefault();
                const good = await run(deleteContatti, { ids: id }, { redirectTo: '/admin/clienti' });
                if (good) setConfirm(false);
              }}
            >
              {pending && <Loader2 className="animate-spin" />}
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export function StageSelect({ id, stato }: { id: string; stato: string }) {
  const [value, setValue] = React.useState(stato);
  const { run, pending } = useAction();
  React.useEffect(() => setValue(stato), [stato]);
  return (
    <Select
      value={value}
      disabled={pending}
      onValueChange={async (v) => {
        const prev = value;
        setValue(v);
        const good = await run(setStatoContatti, { ids: id, stato: v }, { success: `Spostato in “${CONTACT_STAGE[v].label}”` });
        if (!good) setValue(prev);
      }}
    >
      <SelectTrigger className="h-8 w-[170px]" aria-label="Stato del contatto">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {CONTACT_STAGE_KEYS.map((k) => (
          <SelectItem key={k} value={k}>
            {CONTACT_STAGE[k].label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
