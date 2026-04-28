'use client';

import { Phone, MessageCircle } from 'lucide-react';

export default function StickyCTA() {
  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-avorio border-t border-pietra/10 grid grid-cols-2 shadow-lg">
        <a
          href="tel:0815713888"
          className="flex items-center justify-center gap-2 py-4 bg-bordeaux text-avorio text-xs tracking-widest uppercase font-medium"
        >
          <Phone size={16} />
          Chiama 24h
        </a>
        <a
          href="https://wa.me/390815713888"
          className="flex items-center justify-center gap-2 py-4 text-pietra text-xs tracking-widest uppercase font-medium"
        >
          <MessageCircle size={16} />
          WhatsApp
        </a>
      </div>

      <a
        href="https://wa.me/390815713888"
        target="_blank"
        rel="noopener"
        className="hidden md:flex fixed bottom-6 right-6 z-40 w-14 h-14 bg-bordeaux text-avorio rounded-full items-center justify-center shadow-lg hover:bg-bordeaux-dark transition-colors"
        aria-label="WhatsApp"
      >
        <MessageCircle size={22} />
      </a>
    </>
  );
}
