'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Package, Plus, ShoppingBag, User, UserPlus, BellPlus } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { NAV_ITEMS } from '@/lib/admin/nav';
import { GUIDE_INDEX } from '@/lib/admin/guide/index';
import { BookOpen } from 'lucide-react';
import { cercaGlobale, type SearchResults } from '@/lib/admin/search-actions';
import { formatPrice } from '@/lib/shop/format';
import { OrderStatusBadge } from '@/components/admin/status';

const ACTIONS = [
  { label: 'Nuovo contatto', href: '/admin/clienti/nuovo', icon: UserPlus, keywords: 'cliente crm aggiungi' },
  { label: 'Nuova attività o promemoria', href: '/admin/attivita?nuova=1', icon: BellPlus, keywords: 'nota chiamata' },
  { label: 'Nuovo prodotto', href: '/admin/prodotti/nuovo', icon: Plus, keywords: 'articolo catalogo' },
];

export default function CommandMenu({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = React.useState('');
  const [results, setResults] = React.useState<SearchResults | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setQ('');
      setResults(null);
    }
  }, [open]);

  React.useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const r = await cercaGlobale(term);
        if (!cancelled) setResults(r);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 220);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const term = q.trim().toLowerCase();
  const match = (s: string) => !term || s.toLowerCase().includes(term);
  const nav = NAV_ITEMS.filter((i) => match(`${i.label} ${i.keywords ?? ''}`));
  const actions = ACTIONS.filter((a) => match(`${a.label} ${a.keywords}`));
  const guide = term.length >= 2 ? GUIDE_INDEX.filter((g) => match(`${g.title} guida aiuto come`)).slice(0, 4) : [];
  const hasResults =
    !!results && results.contatti.length + results.ordini.length + results.prodotti.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} shouldFilter={false}>
      <Command_ q={q} setQ={setQ} loading={loading} />
      <CommandList>
        {!loading && !hasResults && nav.length === 0 && actions.length === 0 && (
          <CommandEmpty>Nessun risultato per “{q}”.</CommandEmpty>
        )}

        {results && results.contatti.length > 0 && (
          <CommandGroup heading="Contatti">
            {results.contatti.map((c) => (
              <CommandItem key={c.id} value={`c-${c.id}`} onSelect={() => go(`/admin/clienti/${c.id}`)}>
                <User />
                <span className="min-w-0 flex-1 truncate">
                  {c.nome || c.azienda || c.email || c.telefono}
                </span>
                <span className="truncate text-xs text-muted-foreground">{c.email || c.telefono}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results && results.ordini.length > 0 && (
          <CommandGroup heading="Ordini">
            {results.ordini.map((o) => (
              <CommandItem key={o.id} value={`o-${o.id}`} onSelect={() => go(`/admin/ordini/${o.id}`)}>
                <ShoppingBag />
                <span className="font-medium tabular-nums">#{o.numero}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{o.email}</span>
                <OrderStatusBadge stato={o.stato} />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {results && results.prodotti.length > 0 && (
          <CommandGroup heading="Prodotti">
            {results.prodotti.map((p) => (
              <CommandItem key={p.id} value={`p-${p.id}`} onSelect={() => go(`/admin/prodotti/${p.id}`)}>
                <Package />
                <span className="min-w-0 flex-1 truncate">{p.titolo}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{formatPrice(p.prezzo_cent)}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {hasResults && (nav.length > 0 || actions.length > 0) && <CommandSeparator />}

        {actions.length > 0 && (
          <CommandGroup heading="Azioni rapide">
            {actions.map((a) => (
              <CommandItem key={a.href} value={a.label} onSelect={() => go(a.href)}>
                <a.icon />
                {a.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {guide.length > 0 && (
          <CommandGroup heading="Guida all’uso">
            {guide.map((g) => (
              <CommandItem key={g.id} value={`g-${g.id}`} onSelect={() => go(`/admin/guida/${g.id}`)}>
                <BookOpen />
                Come funziona: {g.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {nav.length > 0 && (
          <CommandGroup heading="Vai a">
            {nav.map((i) => (
              <CommandItem key={i.href} value={i.href} onSelect={() => go(i.href)}>
                <i.icon />
                {i.label}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

function Command_({
  q,
  setQ,
  loading,
}: {
  q: string;
  setQ: (v: string) => void;
  loading: boolean;
}) {
  return (
    <div className="relative">
      <CommandInput
        value={q}
        onValueChange={setQ}
        placeholder="Cerca contatti, ordini (#12), prodotti, pagine…"
      />
      {loading && (
        <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
      )}
    </div>
  );
}
