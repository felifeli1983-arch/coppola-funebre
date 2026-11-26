'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, LockKeyhole } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field } from '@/components/ui/label';
import PasswordInput from '@/components/admin/system/PasswordInput';

function messaggioErrore(err: unknown): string {
  const raw = err instanceof Error ? err.message : '';
  // A failed network request surfaces as a generic TypeError ("Failed to fetch").
  if (err instanceof TypeError || /failed to fetch|networkerror|load failed|fetch/i.test(raw)) {
    return 'Impossibile collegarsi al server. Controlla la connessione e riprova.';
  }
  if (/invalid login credentials/i.test(raw)) return 'Email o password non corretti.';
  if (/email not confirmed/i.test(raw)) return 'Account non ancora attivato. Contatta un amministratore.';
  if (/too many|rate limit/i.test(raw)) return 'Troppi tentativi. Attendi qualche minuto e riprova.';
  return 'Accesso non riuscito. Riprova.';
}

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      router.push('/admin');
      router.refresh();
    } catch (err) {
      setError(messaggioErrore(err));
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      {/* Brand panel (desktop) */}
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 0, transparent 45%), radial-gradient(circle at 85% 80%, white 0, transparent 40%)',
          }}
        />
        <div className="relative">
          <div className="inline-flex rounded-xl bg-white px-4 py-3 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/new/logo-coppola.webp" alt="Onoranze Funebri Coppola" className="h-14 w-auto" />
          </div>
        </div>
        <div className="relative max-w-md">
          <p className="font-serif text-4xl leading-tight xl:text-5xl">
            Al fianco delle famiglie, con cura e discrezione.
          </p>
          <p className="mt-4 text-sm text-primary-foreground/75">
            Gestionale riservato: contatti, ordini, negozio e contenuti del sito in un unico posto.
          </p>
        </div>
        <div className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} Eredi Coppola · Mugnano di Napoli
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center bg-muted/30 px-4 py-10 sm:px-6 lg:bg-background">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/img/new/logo-coppola.webp" alt="Onoranze Funebri Coppola" className="h-12 w-auto" />
            </div>
          </div>

          <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
            <div className="mb-6">
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LockKeyhole className="size-5" />
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">Accedi al gestionale</h1>
              <p className="mt-1 text-sm text-muted-foreground">Inserisci le tue credenziali per continuare.</p>
            </div>

            <form onSubmit={onSubmit} className="grid gap-4">
              <Field label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@eredicoppola.com"
                  className="h-10"
                />
              </Field>
              <Field label="Password" htmlFor="password">
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10"
                />
              </Field>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-sm text-destructive"
                >
                  <AlertCircle className="mt-0.5 size-4 flex-none" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" size="lg" className="mt-1 w-full" disabled={loading}>
                {loading && <Loader2 className="animate-spin" />}
                {loading ? 'Accesso in corso…' : 'Accedi'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
