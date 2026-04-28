'use client';

import { motion, useInView, Variants } from 'framer-motion';
import { useRef, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

export default function Reveal({ children, delay = 0, y = 28, className, once = true }: Props) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: '-10% 0px -10% 0px' });

  const variants: Variants = {
    hidden: { opacity: 0, y },
    show: { opacity: 1, y: 0, transition: { duration: 1.1, ease, delay } },
  };

  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function RevealWords({
  text,
  className,
  wordClassName,
  delay = 0,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  const container: Variants = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: delay },
    },
  };
  const word: Variants = {
    hidden: { opacity: 0, y: '100%' },
    show: { opacity: 1, y: 0, transition: { duration: 1, ease } },
  };

  return (
    <motion.span
      ref={ref}
      variants={container}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom pb-1">
          <motion.span variants={word} className={`inline-block ${wordClassName ?? ''}`}>
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

export function RevealImage({
  src,
  alt,
  className,
  imgClassName,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ''}`}>
      <motion.img
        src={src}
        alt={alt}
        initial={{ scale: 1.2 }}
        animate={inView ? { scale: 1 } : { scale: 1.2 }}
        transition={{ duration: 1.6, ease }}
        className={`w-full h-full object-cover photo-warm ${imgClassName ?? ''}`}
      />
      <motion.div
        initial={{ scaleY: 1 }}
        animate={inView ? { scaleY: 0 } : { scaleY: 1 }}
        transition={{ duration: 1.1, ease, delay: 0.1 }}
        style={{ transformOrigin: 'top' }}
        className="absolute inset-0 bg-avorio"
      />
    </div>
  );
}
