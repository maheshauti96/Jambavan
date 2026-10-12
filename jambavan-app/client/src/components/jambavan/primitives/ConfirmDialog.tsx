// ConfirmDialog (§3.5, §12.3): destructive confirmations on Radix AlertDialog. Cancel closes only this dialog and
// Radix returns focus to the trigger. Actions run their handler and then close.
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./Button";
import { useRegisterOpenDialog } from "./dialogRegistry";

export type ConfirmAction = { label: string; onSelect: () => void; variant?: "primary" | "secondary" | "danger" };

export function ConfirmDialog({ open, onOpenChange, title, children, actions, cancelLabel = "Cancel" }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  children: ReactNode;
  actions: ConfirmAction[];
  cancelLabel?: string;
}) {
  useRegisterOpenDialog(open);
  return (
    <AlertDialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Overlay className="fixed inset-0 z-50 bg-[rgba(28,21,18,0.55)] backdrop-blur-[2px]" />
        <AlertDialogPrimitive.Content
          aria-modal="true"
          className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-jb-xl bg-jb-cream-50 p-6 text-jb-ink shadow-jb-e3"
        >
          <AlertDialogPrimitive.Title className="m-0 font-display text-[26px] font-semibold leading-[30px]">{title}</AlertDialogPrimitive.Title>
          <AlertDialogPrimitive.Description asChild>
            <div className="mt-2 text-[15px] leading-[22px] text-jb-earth-600">{children}</div>
          </AlertDialogPrimitive.Description>
          <div className="mt-5 flex flex-wrap justify-end gap-2">
            <AlertDialogPrimitive.Cancel className={buttonVariants({ variant: "ghost" })}>{cancelLabel}</AlertDialogPrimitive.Cancel>
            {actions.map(action => (
              <AlertDialogPrimitive.Action key={action.label} className={cn(buttonVariants({ variant: action.variant ?? "primary" }))} onClick={action.onSelect}>
                {action.label}
              </AlertDialogPrimitive.Action>
            ))}
          </div>
        </AlertDialogPrimitive.Content>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
