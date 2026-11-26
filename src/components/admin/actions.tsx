'use client';

// Client helpers that run server actions with pending state + toast feedback.

import * as React from 'react';
import { useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/dialog';
import type { ActionResult } from '@/lib/admin/types';

type Action = (fd: FormData) => Promise<ActionResult | void>;

/** Submit button that shows a spinner while its parent <form> is pending. */
export function SubmitButton({ children, pendingText, ...props }: ButtonProps & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} {...props}>
      {pending && <Loader2 className="animate-spin" />}
      {pending && pendingText ? pendingText : children}
    </Button>
  );
}

function handleResult(res: ActionResult | void, fallback?: string): boolean {
  if (res && res.ok === false) {
    toast.error(res.message || 'Operazione non riuscita');
    return false;
  }
  const msg = (res && res.message) || fallback;
  if (msg) toast.success(msg);
  return true;
}

/**
 * <form> that calls a server action, toasts the result and refreshes the page.
 * Prefer `redirectTo` over calling redirect() inside the action.
 */
export function ActionForm({
  action,
  success,
  redirectTo,
  resetOnSuccess,
  onSuccess,
  className,
  children,
  id,
}: {
  action: Action;
  success?: string;
  redirectTo?: string | ((res: ActionResult | void) => string | null);
  resetOnSuccess?: boolean;
  onSuccess?: (res: ActionResult | void) => void;
  className?: string;
  children: React.ReactNode;
  id?: string;
}) {
  const router = useRouter();
  const ref = React.useRef<HTMLFormElement>(null);
  return (
    <form
      id={id}
      ref={ref}
      className={className}
      action={async (fd) => {
        let res: ActionResult | void;
        try {
          res = await action(fd);
        } catch (e) {
          console.error(e);
          toast.error('Si è verificato un errore. Riprova.');
          return;
        }
        if (!handleResult(res, success)) return;
        if (resetOnSuccess) ref.current?.reset();
        onSuccess?.(res);
        const to = typeof redirectTo === 'function' ? redirectTo(res) : redirectTo;
        // router.refresh() right after push() cancels the navigation in Next 14;
        // revalidatePath in the action already invalidates the target's data.
        if (to) router.push(to);
        else router.refresh();
      }}
    >
      {children}
    </form>
  );
}

/** Run an action with explicit data (no form), e.g. from a menu item. */
export function useAction() {
  const router = useRouter();
  const [pending, start] = React.useTransition();
  const run = React.useCallback(
    (
      action: Action,
      data: Record<string, string | number | boolean | null | undefined>,
      opts: { success?: string; redirectTo?: string } = {},
    ) =>
      new Promise<boolean>((resolve) => {
        start(async () => {
          const fd = new FormData();
          for (const [k, v] of Object.entries(data)) if (v != null) fd.append(k, String(v));
          try {
            const res = await action(fd);
            const good = handleResult(res, opts.success);
            if (good && opts.redirectTo) router.push(opts.redirectTo);
            else router.refresh();
            resolve(good);
          } catch (e) {
            console.error(e);
            toast.error('Si è verificato un errore. Riprova.');
            resolve(false);
          }
        });
      }),
    [router],
  );
  return { run, pending };
}

/** Button guarded by a confirmation dialog (for destructive actions). */
export function ConfirmAction({
  action,
  data,
  title,
  description,
  confirmLabel = 'Conferma',
  success,
  redirectTo,
  destructive = true,
  children,
  trigger,
}: {
  action: Action;
  data: Record<string, string | number | boolean | null | undefined>;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  success?: string;
  redirectTo?: string;
  destructive?: boolean;
  children?: React.ReactNode;
  /** Custom trigger element (rendered asChild). */
  trigger?: React.ReactElement;
}) {
  const { run, pending } = useAction();
  const [open, setOpen] = React.useState(false);
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button variant={destructive ? 'outline' : 'default'} size="sm" className={destructive ? 'text-destructive hover:text-destructive' : ''}>
            {children}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Annulla</AlertDialogCancel>
          <AlertDialogAction
            destructive={destructive}
            disabled={pending}
            onClick={async (e) => {
              e.preventDefault();
              const good = await run(action, data, { success, redirectTo });
              if (good) setOpen(false);
            }}
          >
            {pending && <Loader2 className="animate-spin" />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
