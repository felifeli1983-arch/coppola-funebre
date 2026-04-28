'use client';

import { motion } from 'framer-motion';

export default function Marquee({ items }: { items: string[] }) {
  const row = [...items, ...items, ...items];
  return (
    <div className="py-10 md:py-14 bg-pietra overflow-hidden border-y border-avorio/10">
      <motion.div
        animate={{ x: ['0%', '-33.333%'] }}
        transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
        className="flex whitespace-nowrap gap-16 text-avorio/80"
      >
        {row.map((it, i) => (
          <span key={i} className="flex items-center gap-16 font-serif text-3xl md:text-5xl italic">
            {it}
            <span className="text-oro not-italic">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
