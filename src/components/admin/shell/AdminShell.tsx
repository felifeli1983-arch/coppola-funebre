'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { guideTopicForPath } from '@/lib/admin/guide/index';
import {
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  KeyRound,
  LogOut,
  Menu,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
} from 'lucide-react';
import { cn, initials } from '@/lib/utils';
import { NAV, breadcrumbsFor, isActive, type NavItem } from '@/lib/admin/nav';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Hint,
  TooltipProvider,
} from '@/components/ui/primitives';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Toaster } from '@/components/ui/sonner';
import CommandMenu from './CommandMenu';
import AdminTour, { startAdminTour } from '@/components/admin/guide/Tour';

export type ShellCounters = { ordiniDaGestire: number; promemoria: number };

type ShellCtx = {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setMobileOpen: (o: boolean) => void;
  setCommandOpen: (o: boolean) => void;
};
const ShellContext = React.createContext<ShellCtx | null>(null);
export function useShell() {
  const ctx = React.useContext(ShellContext);
  if (!ctx) throw new Error('useShell must be used inside <AdminShell>');
  return ctx;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=31536000; samesite=lax`;
}

/** "⌘" on Apple devices, "Ctrl+" elsewhere — for shortcut hints. */
export function useModKey() {
  const [mod, setMod] = React.useState('⌘');
  React.useEffect(() => {
    if (!/Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent)) setMod('Ctrl+');
  }, []);
  return mod;
}

export default function AdminShell({
  userEmail,
  userName,
  tourDone,
  counters,
  defaultCollapsed,
  children,
}: {
  userEmail: string | null;
  userName?: string | null;
  tourDone: boolean;
  counters: ShellCounters;
  defaultCollapsed: boolean;
  children: React.ReactNode;
}) {
  const mod = useModKey();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((c) => {
      setCookie('admin_sidebar', c ? 'expanded' : 'collapsed');
      return !c;
    });
  }, []);

  // Close the mobile drawer whenever the route changes.
  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ⌘/Ctrl+K → search, ⌘/Ctrl+B → toggle sidebar.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'k') {
        e.preventDefault();
        setCommandOpen((o) => !o);
      } else if (k === 'b') {
        e.preventDefault();
        if (window.matchMedia('(min-width: 768px)').matches) toggleCollapsed();
        else setMobileOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleCollapsed]);

  const ctx = React.useMemo(
    () => ({ collapsed, toggleCollapsed, setMobileOpen, setCommandOpen }),
    [collapsed, toggleCollapsed],
  );

  return (
    <ShellContext.Provider value={ctx}>
      <TooltipProvider delayDuration={150}>
        <div className="flex min-h-dvh w-full">
          {/* Desktop sidebar */}
          <aside
            data-tour="sidebar"
            className={cn(
              'sticky top-0 hidden h-dvh flex-none flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out md:flex',
              collapsed ? 'w-[60px]' : 'w-64',
            )}
          >
            <SidebarBody collapsed={collapsed} counters={counters} pathname={pathname} />
            <div className="border-t border-sidebar-border p-2">
              <Hint label={collapsed ? `Espandi menu (${mod}B)` : `Riduci menu (${mod}B)`} side="right">
                <button
                  onClick={toggleCollapsed}
                  className={cn(
                    'flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-sm text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    collapsed && 'justify-center px-0',
                  )}
                >
                  {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
                  {!collapsed && <span>Riduci menu</span>}
                </button>
              </Hint>
            </div>
          </aside>

          {/* Mobile drawer */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetContent
              side="left"
              className="w-[280px] gap-0 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
            >
              <SheetTitle className="sr-only">Menu</SheetTitle>
              <SidebarBody
                collapsed={false}
                counters={counters}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 flex-col">
            <Topbar userEmail={userEmail} pathname={pathname} />
            <main className="mx-auto w-full min-w-0 max-w-[1680px] flex-1 px-4 py-5 sm:px-6 md:py-7 lg:px-8 2xl:px-10">
              {children}
            </main>
          </div>
        </div>
        <CommandMenu open={commandOpen} onOpenChange={setCommandOpen} />
        <AdminTour autoStart={!tourDone} userName={userName || userEmail || ''} />
        <Toaster />
      </TooltipProvider>
    </ShellContext.Provider>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────

function SidebarBody({
  collapsed,
  counters,
  pathname,
  onNavigate,
}: {
  collapsed: boolean;
  counters: ShellCounters;
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className={cn('flex h-14 flex-none items-center gap-2.5 border-b border-sidebar-border px-3', collapsed && 'justify-center px-0')}>
        <Link href="/admin" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5" aria-label="Eredi Coppola – Dashboard">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/new/logo-coppola.webp"
            alt="Onoranze Funebri Coppola"
            width={34}
            height={40}
            className="h-10 w-auto flex-none rounded-[3px] shadow-sm"
          />
          {!collapsed && (
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold text-foreground">Eredi Coppola</span>
              <span className="block truncate text-[11px] text-muted-foreground">Gestionale</span>
            </span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3">
        {NAV.map((section) => (
          <NavSectionBlock
            key={section.id}
            id={section.id}
            label={section.label}
            items={section.items}
            collapsed={collapsed}
            counters={counters}
            pathname={pathname}
            onNavigate={onNavigate}
          />
        ))}
      </nav>
    </>
  );
}

function useSectionOpen(id: string): [boolean, (o: boolean) => void] {
  const [open, setOpen] = React.useState(true);
  React.useEffect(() => {
    try {
      if (localStorage.getItem(`admin_nav_${id}`) === '0') setOpen(false);
    } catch {
      /* storage unavailable */
    }
  }, [id]);
  const set = (o: boolean) => {
    setOpen(o);
    try {
      localStorage.setItem(`admin_nav_${id}`, o ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
  };
  return [open, set];
}

function NavSectionBlock({
  id,
  label,
  items,
  collapsed,
  counters,
  pathname,
  onNavigate,
}: {
  id: string;
  label?: string;
  items: NavItem[];
  collapsed: boolean;
  counters: ShellCounters;
  pathname: string;
  onNavigate?: () => void;
}) {
  const [open, setOpen] = useSectionOpen(id);
  const hasActive = items.some((i) => isActive(i, pathname));
  const list = (
    <ul className="grid gap-0.5">
      {items.map((item) => (
        <li key={item.href}>
          <NavLink
            item={item}
            collapsed={collapsed}
            active={isActive(item, pathname)}
            count={item.badge ? counters[item.badge] : 0}
            onNavigate={onNavigate}
          />
        </li>
      ))}
    </ul>
  );

  if (!label) return <div className="mb-3">{list}</div>;
  if (collapsed) {
    return (
      <div className="mb-2 border-t border-sidebar-border pt-2 first:border-0 first:pt-0">{list}</div>
    );
  }
  return (
    <Collapsible open={open || hasActive} onOpenChange={setOpen} className="mb-3">
      <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80 transition-colors hover:text-foreground">
        {label}
        <ChevronDown className="size-3.5 transition-transform group-data-[state=closed]:-rotate-90" />
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-1">{list}</CollapsibleContent>
    </Collapsible>
  );
}

function NavLink({
  item,
  collapsed,
  active,
  count,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  count: number;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      data-tour={item.href === '/admin/ordini' ? 'nav-ordini' : undefined}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex h-9 items-center gap-3 rounded-md px-2.5 text-sm transition-colors',
        active
          ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
          : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground',
        collapsed && 'justify-center px-0',
      )}
    >
      {active && (
        <span className="absolute inset-y-1.5 left-0 w-[3px] rounded-r-full bg-sidebar-primary" />
      )}
      <Icon className={cn('size-[18px] flex-none', active ? 'text-sidebar-primary' : 'opacity-80')} strokeWidth={1.9} />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
      {count > 0 &&
        (collapsed ? (
          <span className="absolute right-2 top-1.5 size-2 rounded-full bg-primary ring-2 ring-sidebar" />
        ) : (
          <span className="ml-auto flex h-5 min-w-5 flex-none items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground tabular-nums">
            {count > 99 ? '99+' : count}
          </span>
        ))}
    </Link>
  );
  return (
    <Hint label={count > 0 ? `${item.label} · ${count}` : item.label} side="right" disabled={!collapsed}>
      {link}
    </Hint>
  );
}

// ── Topbar ─────────────────────────────────────────────────────────────────

function Topbar({ userEmail, pathname }: { userEmail: string | null; pathname: string }) {
  const { collapsed, toggleCollapsed, setMobileOpen, setCommandOpen } = useShell();
  const crumbs = breadcrumbsFor(pathname);
  const mod = useModKey();

  return (
    <header className="sticky top-0 z-30 flex h-14 flex-none items-center gap-2 border-b bg-background/85 px-3 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Apri menu"
        data-tour="mobile-menu"
      >
        <Menu />
      </Button>
      <Hint label={collapsed ? `Espandi menu (${mod}B)` : `Riduci menu (${mod}B)`}>
        <Button
          variant="ghost"
          size="icon-sm"
          data-tour="collapse"
          className="hidden md:inline-flex"
          onClick={toggleCollapsed}
          aria-label="Mostra/nascondi menu"
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </Button>
      </Hint>
      <div className="mx-1 hidden h-5 w-px bg-border md:block" />

      <nav aria-label="Percorso" className="flex min-w-0 flex-1 items-center gap-1 text-sm">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1;
          return (
            <React.Fragment key={c.href}>
              {i > 0 && (
                <ChevronRight className="hidden size-3.5 flex-none text-muted-foreground/60 sm:block" />
              )}
              {last ? (
                <span className="truncate font-medium text-foreground">{c.label}</span>
              ) : (
                <Link
                  href={c.href}
                  className="hidden truncate text-muted-foreground transition-colors hover:text-foreground sm:block"
                >
                  {c.label}
                </Link>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <button
        onClick={() => setCommandOpen(true)}
        data-tour="search"
        className="hidden h-8 w-56 items-center gap-2 rounded-md border bg-muted/40 px-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted lg:flex"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Cerca…</span>
        <kbd className="rounded border bg-background px-1.5 font-sans text-[10px] font-medium">{mod}K</kbd>
      </button>
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={() => setCommandOpen(true)}
        aria-label="Cerca"
        data-tour="search"
      >
        <Search />
      </Button>
      <Hint label="Apri il sito">
        <Button variant="ghost" size="icon-sm" asChild className="hidden sm:inline-flex">
          <a href="/" target="_blank" rel="noreferrer" aria-label="Apri il sito">
            <ExternalLink />
          </a>
        </Button>
      </Hint>
      <HelpButton pathname={pathname} />
      <ThemeToggle />
      <UserMenu email={userEmail} />
    </header>
  );
}

/** Contextual help: opens the guide article for the current page. */
function HelpButton({ pathname }: { pathname: string }) {
  const topic = guideTopicForPath(pathname);
  const href = topic ? `/admin/guida/${topic.id}` : '/admin/guida';
  return (
    <Hint label={topic ? `Come funziona: ${topic.title}` : 'Guida all’uso'}>
      <Button variant="ghost" size="icon-sm" asChild data-tour="help">
        <Link href={href} aria-label="Aiuto per questa pagina">
          <CircleHelp />
        </Link>
      </Button>
    </Hint>
  );
}

function ThemeToggle() {
  const [dark, setDark] = React.useState(false);
  React.useEffect(() => setDark(document.body.classList.contains('dark')), []);
  const toggle = () => {
    const next = !dark;
    document.body.classList.toggle('dark', next);
    setCookie('admin_theme', next ? 'dark' : 'light');
    setDark(next);
  };
  return (
    <Hint label={dark ? 'Tema chiaro' : 'Tema scuro'}>
      <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label="Cambia tema">
        {dark ? <Sun /> : <Moon />}
      </Button>
    </Hint>
  );
}

function UserMenu({ email }: { email: string | null }) {
  const router = useRouter();
  const logout = async () => {
    try {
      await createClient().auth.signOut();
    } catch {
      /* ignore */
    }
    router.push('/admin/login');
    router.refresh();
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="ml-1 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Menu utente"
          data-tour="user-menu"
        >
          <Avatar className="size-8">
            <AvatarFallback>{initials(null, email)}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="font-normal">
          <div className="text-xs text-muted-foreground">Accesso come</div>
          <div className="truncate text-sm font-medium text-foreground">{email ?? 'Amministratore'}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/impostazioni/utenti">
            <KeyRound /> Account e password
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href="/" target="_blank" rel="noreferrer">
            <ExternalLink /> Apri il sito
          </a>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/admin/guida">
            <BookOpen /> Guida all’uso
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTimeout(startAdminTour, 150)}>
          <Sparkles /> Rivedi il tour
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={logout}>
          <LogOut /> Esci
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
