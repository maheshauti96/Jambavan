// Dialog primitive (§3.5) on Radix Dialog: role="dialog", aria-modal="true", focus trap, Escape closes, focus returns
// to the trigger, and the first invalid (else first) field is focused on open.
// Layout: header (eyebrow, display title, description, close IconButton), a scrolling body and a sticky footer, so the
// primary action is always visible (fixes A3). Below 768 px it is a full-screen sheet with a 20 px top radius.
// Errors raised while it is open render in the `error` slot as InlineError above the footer, never as a toast (M7).
import "../styles/primitives.css";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "./Button";
import { useRegisterOpenDialog } from "./dialogRegistry";

const widths = {
  sm: "md:max-w-[560px]",
  md: "md:max-w-[720px]",
  lg: "md:max-w-[880px]",
} as const;

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  /** sm 560 (task, handover, feedback, attachment, profile, access) · md 720 (MOM, notice, calendar) · lg 880 (event) */
  size?: keyof typeof widths;
  footer?: ReactNode;
  /** InlineError slot, rendered directly above the footer */
  error?: ReactNode;
  children: ReactNode;
  closeLabel?: string;
  className?: string;
};

const FIELD_SELECTOR =
  "input:not([type=hidden]):not([disabled]), select:not([disabled]), textarea:not([disabled])";

export function Dialog({
  open,
  onOpenChange,
  title,
  eyebrow,
  description,
  size = "sm",
  footer,
  error,
  children,
  closeLabel = "Close dialog",
  className,
}: DialogProps) {
  useRegisterOpenDialog(open);
  const bodyRef = useRef<HTMLDivElement>(null);
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="jb-dialog-overlay fixed inset-0 z-50 bg-[rgba(28,21,18,0.55)] backdrop-blur-[2px]" />
        <DialogPrimitive.Content
          aria-modal="true"
          {...(description ? {} : { "aria-describedby": undefined })}
          onOpenAutoFocus={event => {
            const body = bodyRef.current;
            const target =
              body?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
              body?.querySelector<HTMLElement>(FIELD_SELECTOR);
            if (target) {
              event.preventDefault();
              target.focus();
            }
          }}
          className={cn(
            "jb-dialog fixed z-50 flex flex-col overflow-hidden bg-jb-cream-50 text-jb-ink shadow-jb-e3 outline-none",
            "max-md:inset-x-0 max-md:bottom-0 max-md:top-[max(8px,env(safe-area-inset-top))] max-md:rounded-t-[20px]",
            "md:left-1/2 md:top-1/2 md:max-h-[min(90dvh,900px)] md:w-[calc(100%-2rem)] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-jb-xl",
            widths[size],
            className
          )}
        >
          <header className="flex items-start gap-3 border-b border-jb-sand-300 px-5 pb-4 pt-5 md:px-6">
            <div className="min-w-0 flex-1">
              {eyebrow && <p className="jb-eyebrow mb-1">{eyebrow}</p>}
              <DialogPrimitive.Title className="m-0 font-display text-[30px] font-semibold leading-[34px] text-jb-ink">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="m-0 mt-1 text-[15px] leading-[22px] text-jb-earth-600">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <IconButton
                aria-label={closeLabel}
                icon={<X />}
                className="-mr-2 -mt-1"
              />
            </DialogPrimitive.Close>
          </header>
          <div
            ref={bodyRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 md:px-6"
          >
            {children}
          </div>
          {(error || footer) && (
            <footer className="border-t border-jb-sand-300 bg-jb-cream-50 px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 md:px-6">
              {error && <div className="mb-3">{error}</div>}
              {footer && (
                <div className="flex flex-wrap items-center justify-end gap-2">
                  {footer}
                </div>
              )}
            </footer>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export const DialogClose = DialogPrimitive.Close;
