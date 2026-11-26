// Server-safe layout building blocks for admin pages.

import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowUpRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

export function PageHeader({
  title,
  description,
  actions,
  back,
  meta,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            {back.label}
          </Link>
        )}
        <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-[1.65rem]">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
        {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
      </div>
      {actions && <div className="flex flex-none flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact,
}: {
  icon: LucideIcon;
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        compact ? 'py-8' : 'py-14',
        className,
      )}
    >
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </div>
      <div className="font-medium">{title}</div>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  hint,
  href,
  tone = 'default',
}: {
  label: string;
  value: React.ReactNode;
  icon: LucideIcon;
  hint?: React.ReactNode;
  href?: string;
  tone?: 'default' | 'warning' | 'success' | 'brand';
}) {
  const toneCls = {
    default: 'bg-muted text-muted-foreground',
    warning: 'bg-warning/15 text-warning',
    success: 'bg-success/10 text-success',
    brand: 'bg-primary/10 text-primary',
  }[tone];
  const body = (
    <Card
      className={cn(
        'h-full p-4 transition-colors sm:p-5',
        href && 'group hover:border-foreground/15 hover:bg-muted/30',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-sm text-muted-foreground">{label}</div>
        <span className={cn('flex size-8 flex-none items-center justify-center rounded-md', toneCls)}>
          <Icon className="size-4" />
        </span>
      </div>
      <div className="mt-2 truncate text-2xl font-semibold tracking-tight tabular-nums">{value}</div>
      {hint && (
        <div className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <span className="truncate">{hint}</span>
          {href && <ArrowUpRight className="size-3 flex-none opacity-0 transition-opacity group-hover:opacity-100" />}
        </div>
      )}
    </Card>
  );
  return href ? (
    <Link href={href} className="block min-w-0">
      {body}
    </Link>
  ) : (
    <div className="min-w-0">{body}</div>
  );
}

/** Two-column "label: value" list used in detail sidebars. */
export function InfoList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid gap-3 text-sm">
      {items.map((it) => (
        <div key={it.label} className="grid min-w-0 grid-cols-[110px_1fr] gap-3">
          <dt className="text-muted-foreground">{it.label}</dt>
          <dd className="min-w-0 break-words">{it.value || <span className="text-muted-foreground">—</span>}</dd>
        </div>
      ))}
    </dl>
  );
}
