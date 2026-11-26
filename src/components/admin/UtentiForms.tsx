'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createAdminUtente, changeMyPassword } from '@/lib/admin-actions';

const label = 'text-xs font-medium uppercase tracking-wide text-stone-500';
const field = 'mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]';

function Submit({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="rounded-md bg-[#7F1518] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5A0F12] disabled:opacity-60"
    >
      {pending ? 'Attendere…' : children}
    </button>
  );
}

function Feedback({ state }: { state: { ok: boolean; message: string } | null }) {
  if (!state?.message) return null;
  return (
    <p className={`text-sm ${state.ok ? 'text-green-700' : 'text-red-600'}`}>{state.message}</p>
  );
}

export function CreateAdminForm() {
  const [state, action] = useFormState(createAdminUtente, null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="block">
        <span className={label}>Email</span>
        <input name="email" type="email" required className={field} placeholder="nuovo@eredicoppola.com" />
      </label>
      <label className="block">
        <span className={label}>Password</span>
        <input name="password" type="password" required minLength={8} className={field} placeholder="min. 8 caratteri" />
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <Submit>Crea utente</Submit>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useFormState(changeMyPassword, null);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="block sm:col-span-2">
        <span className={label}>Nuova password</span>
        <input name="password" type="password" required minLength={8} className={field} placeholder="min. 8 caratteri" />
      </label>
      <div className="flex items-center gap-4 sm:col-span-2">
        <Submit>Aggiorna password</Submit>
        <Feedback state={state} />
      </div>
    </form>
  );
}
