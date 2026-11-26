'use client';

import { Minus, Plus } from 'lucide-react';

/** Quantity stepper with 40px+ tap targets. `min` is the lowest value (0 = allow removal). */
export default function QtyStepper({
  value,
  onChange,
  min = 1,
  max,
  size = 'md',
  label = 'Quantità',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  label?: string;
}) {
  const h = size === 'sm' ? 'h-10' : 'h-12';
  const w = size === 'sm' ? 'w-10' : 'w-12';
  const atMax = max != null && value >= max;
  return (
    <div
      className={`inline-flex ${h} items-stretch border border-pietra/20 bg-white`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${w} inline-flex items-center justify-center text-pietra transition-colors hover:bg-pietra/5 disabled:opacity-30`}
        aria-label="Diminuisci quantità"
      >
        <Minus size={15} />
      </button>
      <span
        className="inline-flex min-w-9 items-center justify-center border-x border-pietra/10 px-1 text-sm font-medium tabular-nums text-pietra"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={atMax}
        className={`${w} inline-flex items-center justify-center text-pietra transition-colors hover:bg-pietra/5 disabled:opacity-30`}
        aria-label="Aumenta quantità"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}
