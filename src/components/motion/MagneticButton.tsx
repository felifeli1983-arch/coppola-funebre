'use client';

import { motion, useMotionValue, useSpring } from 'framer-motion';
import { ReactNode, useRef, MouseEvent, ElementType } from 'react';

type Props = {
  children: ReactNode;
  href?: string;
  className?: string;
  as?: ElementType;
  [key: string]: unknown;
};

export default function MagneticButton({ children, href, className, as, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });

  const onMove = (e: MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.25);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  const MotionTag = motion.create(as ?? (href ? 'a' : 'button'));

  return (
    <MotionTag
      ref={ref as never}
      href={href}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ x: sx, y: sy }}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
