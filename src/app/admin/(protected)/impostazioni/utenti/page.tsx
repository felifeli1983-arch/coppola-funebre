import type { Metadata } from 'next';
import { KeyRound, ShieldCheck, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, initials } from '@/lib/utils';
import { PageHeader } from '@/components/admin/kit';
import { Card, CardContent, CardHeaderRow } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/primitives';
import { AddAdminDialog, PasswordForm, RemoveAdminButton } from '@/components/admin/system/UtentiClient';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Utenti e accesso' };

type Admin = { user_id: string; email: string; created_at: string | null };

export default async function UtentiPage() {
  const s = createClient();
  const [{ data: auth }, { data }] = await Promise.all([
    s.auth.getUser(),
    s.from('admins').select('user_id, email, created_at').order('created_at', { ascending: true }),
  ]);
  const me = auth.user?.id;
  const admins = (data ?? []) as Admin[];

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-5">
      <PageHeader
        title="Utenti e accesso"
        description="Chi può entrare nel gestionale. Ogni amministratore ha accesso completo."
        actions={<AddAdminDialog />}
        className="mb-0"
      />

      <Card>
        <CardHeaderRow
          title="Amministratori"
          description={`${admins.length} ${admins.length === 1 ? 'persona ha' : 'persone hanno'} accesso`}
          icon={<Users />}
        />
        <CardContent className="px-0 pb-1">
          <ul className="divide-y border-t">
            {admins.map((a) => {
              const isMe = a.user_id === me;
              return (
                <li key={a.user_id} className="flex min-w-0 items-center gap-3 px-5 py-3">
                  <Avatar className="size-9">
                    <AvatarFallback>{initials(null, a.email)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="truncate text-sm font-medium">{a.email}</span>
                      {isMe && (
                        <Badge variant="brand" className="flex-none">
                          Tu
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {a.created_at ? `Aggiunto il ${formatDate(a.created_at)}` : 'Amministratore'}
                    </div>
                  </div>
                  {!isMe && admins.length > 1 && <RemoveAdminButton userId={a.user_id} email={a.email} />}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card id="password">
        <CardHeaderRow
          title="La tua password"
          description="Usa una password lunga e diversa da quelle di altri servizi."
          icon={<KeyRound />}
        />
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 flex-none text-success" />
        <p>
          Per sicurezza, esci dal gestionale quando usi un computer condiviso e non comunicare mai la password
          per email o messaggio.
        </p>
      </div>
    </div>
  );
}
