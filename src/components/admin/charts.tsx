'use client';

import * as React from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

// Recharts wrappers themed with the admin CSS tokens (light + dark).

export type ChartSeries = {
  key: string;
  label: string;
  kind: 'area' | 'bar' | 'line';
  /** 1–5 → hsl(var(--chart-n)) */
  color: 1 | 2 | 3 | 4 | 5;
  format?: 'eur' | 'int';
  axis?: 'left' | 'right';
};

const color = (n: number) => `hsl(var(--chart-${n}))`;

const eurFull = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' });
const eurCompact = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const intFull = new Intl.NumberFormat('it-IT');
const intCompact = new Intl.NumberFormat('it-IT', { notation: 'compact', maximumFractionDigits: 1 });
const tickDate = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short', timeZone: 'UTC' });
const longDate = new Intl.DateTimeFormat('it-IT', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

const parseDay = (v: unknown) => new Date(`${String(v)}T12:00:00Z`);
const fmt = (v: number, f: ChartSeries['format'], compact = false) =>
  f === 'eur' ? (compact ? eurCompact : eurFull).format(v) : (compact ? intCompact : intFull).format(v);

function ChartTooltip({
  active,
  payload,
  label,
  series,
}: TooltipProps<number, string> & { series: ChartSeries[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[160px] rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <div className="mb-1.5 font-medium capitalize">{longDate.format(parseDay(label))}</div>
      <div className="grid gap-1">
        {series.map((s) => {
          const p = payload.find((x) => x.dataKey === s.key);
          if (!p) return null;
          return (
            <div key={s.key} className="flex items-center gap-2">
              <span className="size-2.5 flex-none rounded-[3px]" style={{ background: color(s.color) }} />
              <span className="flex-1 text-muted-foreground">{s.label}</span>
              <span className="font-medium tabular-nums">{fmt(Number(p.value ?? 0), s.format)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Time series over day keys (YYYY-MM-DD). Mixes area/bar/line on 1–2 axes. */
export function TrendChart({
  data,
  xKey = 'giorno',
  series,
  height = 260,
  emptyTitle = 'Nessun dato nel periodo',
  emptyDescription,
}: {
  data: Record<string, string | number>[];
  xKey?: string;
  series: ChartSeries[];
  height?: number;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  const id = React.useId().replace(/:/g, '');
  const isEmpty = data.every((d) => series.every((s) => !Number(d[s.key])));
  const hasRight = series.some((s) => s.axis === 'right');
  const leftFormat = series.find((s) => (s.axis ?? 'left') === 'left')?.format;
  const rightFormat = series.find((s) => s.axis === 'right')?.format;

  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: hasRight ? 0 : 8, left: 0, bottom: 0 }}>
          <defs>
            {series
              .filter((s) => s.kind === 'area')
              .map((s) => (
                <linearGradient key={s.key} id={`${id}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color(s.color)} stopOpacity={0.28} />
                  <stop offset="95%" stopColor={color(s.color)} stopOpacity={0.02} />
                </linearGradient>
              ))}
          </defs>
          <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={28}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => tickDate.format(parseDay(v))}
          />
          <YAxis
            yAxisId="left"
            tickLine={false}
            axisLine={false}
            width={52}
            allowDecimals={leftFormat === 'eur'}
            tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
            tickFormatter={(v) => fmt(Number(v), leftFormat, true)}
          />
          {hasRight && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tickLine={false}
              axisLine={false}
              width={32}
              allowDecimals={false}
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => fmt(Number(v), rightFormat, true)}
            />
          )}
          {!isEmpty && (
            <Tooltip
              cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, fill: 'hsl(var(--muted) / 0.4)' }}
              content={<ChartTooltip series={series} />}
            />
          )}
          {series.map((s) => {
            const axis = s.axis ?? 'left';
            if (s.kind === 'bar')
              return (
                <Bar
                  key={s.key}
                  yAxisId={axis}
                  dataKey={s.key}
                  name={s.label}
                  fill={color(s.color)}
                  fillOpacity={0.55}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={14}
                />
              );
            if (s.kind === 'line')
              return (
                <Line
                  key={s.key}
                  yAxisId={axis}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={color(s.color)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              );
            return (
              <Area
                key={s.key}
                yAxisId={axis}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color(s.color)}
                strokeWidth={2}
                fill={`url(#${id}-${s.key})`}
                activeDot={{ r: 4 }}
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
      {isEmpty && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-card/60 text-center backdrop-blur-[1px]">
          <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <LineChartIcon className="size-4" />
          </div>
          <div className="text-sm font-medium">{emptyTitle}</div>
          {emptyDescription && <div className="mt-0.5 max-w-xs px-4 text-xs text-muted-foreground">{emptyDescription}</div>}
        </div>
      )}
    </div>
  );
}

/** Legend chips for a TrendChart. */
export function ChartLegend({ series }: { series: Pick<ChartSeries, 'label' | 'color'>[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {series.map((s) => (
        <span key={s.label} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-[3px]" style={{ background: color(s.color) }} />
          {s.label}
        </span>
      ))}
    </div>
  );
}
