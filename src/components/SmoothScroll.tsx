'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

export default function SmoothScroll() {
  useEffect(() => {
    // Disable Lenis on touch devices — native scroll is smoother on iOS/Android
    const isTouch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouch) return;

    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 0,
      syncTouch: false,
      lerp: 0.085,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return null;
}
