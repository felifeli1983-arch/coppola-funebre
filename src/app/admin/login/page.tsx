'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/env';

export default function AdminLogin() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!configured) return;
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Accesso non riuscito.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-100 p-4">
      <div className="w-full max-w-sm rounded-xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/new/logo-coppola.webp" alt="Onoranze Funebri Coppola" className="h-20 w-auto" />
          <div className="mt-3 text-[11px] uppercase tracking-widest text-stone-400">
            Pannello admin
          </div>
        </div>

        {!configured && (
          <div className="mb-5 rounded-md bg-amber-100 px-3 py-2 text-xs text-amber-900">
            Supabase non ancora collegato: il login si attiverà dopo la connessione.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Email
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Password
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm outline-none focus:border-[#7F1518]"
            />
          </label>

          {error && <div className="text-sm text-[#7F1518]">{error}</div>}

          <button
            type="submit"
            disabled={!configured || loading}
            className="w-full rounded-md bg-[#7F1518] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#5A0F12] disabled:opacity-50"
          >
            {loading ? 'Accesso…' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
