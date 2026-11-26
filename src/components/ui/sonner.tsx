'use client';

import { Toaster as Sonner } from 'sonner';

export { toast } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group rounded-lg border bg-background text-foreground shadow-lg font-sans text-sm',
          description: 'text-muted-foreground',
        },
      }}
    />
  );
}
