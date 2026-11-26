'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrintButton() {
  return (
    <Button size="sm" onClick={() => window.print()}>
      <Printer />
      Stampa
    </Button>
  );
}
