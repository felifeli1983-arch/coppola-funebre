import Link from 'next/link';
import { ArrowLeft, UserPlus, KeyRound, Users, Trash2, AlertTriangle } from 'lucide-react';
import { getAdmins } from '@/lib/shop/admin-queries';
import { removeAdminUtente } from '@/lib/admin-actions';
import { isSupabaseAdminConfigured, isSupabaseConfigured } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';
import { CreateAdminForm, ChangePasswordForm } from '@/components/admin/UtentiForms';

export const dynamic = 'force-dynamic';

export default async function Utenti() {
  const [admins] = await Promise.all([getAdmins()]);
  const adminConfigured = isSupabaseAdminConfigured();

  let myId: string | null = null;
  if (isSupabaseConfigured()) {
    const { data } = await createClient().auth.getUser();
    myId = data.user?.id ?? null;
  }

  return (
    <div className="max-w-3xl">
      <Link href="/admin/impostazioni" className="mb-4 inline-flex items-center gap-2 text-sm text-stone-500 hover:text-[#7F1518]">
        <ArrowLeft size={16} /> Impostazioni
      </Link>
      <h1 className="font-serif text-3xl text-stone-900">Utenti admin</h1>
      <p className="mt-1 text-stone-500">Chi può accedere al pannello di amministrazione.</p>

      {/* Current admins */}
      <section className="mt-6 overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="flex items-center gap-2 border-b border-stone-100 p-4">
          <Users size={18} className="text-[#7F1518]" />
          <h2 className="font-medium text-stone-900">Amministratori ({admins.length})</h2>
        </div>
        {admins.length === 0 ? (
          <p className="p-4 text-sm text-stone-500">Nessun amministratore in elenco.</p>
        ) : (
          <ul className="divide-y divide-stone-100">
            {admins.map((a) => (
              <li key={a.user_id} className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-stone-100 text-sm font-medium text-stone-600">
                  {(a.email || '?').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-stone-900">{a.email || '—'}</div>
                  {a.user_id === myId && <span className="text-xs text-stone-400">Tu</span>}
                </div>
                {a.user_id !== myId && (
                  <form action={removeAdminUtente}>
                    <input type="hidden" name="user_id" value={a.user_id} />
                    <button className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-stone-400 hover:bg-red-50 hover:text-red-600" title="Revoca accesso">
                      <Trash2 size={14} /> Rimuovi
                    </button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Create new admin */}
      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserPlus size={18} className="text-[#7F1518]" />
          <h2 className="font-medium text-stone-900">Nuovo amministratore</h2>
        </div>
        {!adminConfigured && (
          <div className="mb-4 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle size={16} className="mt-0.5 flex-none" />
            <span>
              Per creare nuovi utenti direttamente da qui serve la variabile d’ambiente{' '}
              <code className="rounded bg-amber-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> (da aggiungere su Vercel).
              Senza, aggiungi gli utenti dalla dashboard Supabase.
            </span>
          </div>
        )}
        <CreateAdminForm />
      </section>

      {/* Change own password */}
      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <KeyRound size={18} className="text-[#7F1518]" />
          <h2 className="font-medium text-stone-900">La mia password</h2>
        </div>
        <ChangePasswordForm />
      </section>
    </div>
  );
}
