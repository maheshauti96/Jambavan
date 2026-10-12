// Open-dialog registry (§3.5 Toasts, §14.3; review M7 and round 3 M1).
// A counter with one hook, useRegisterOpenDialog(open). Every Dialog primitive registers itself, and from
// increment 2 every legacy modal that is not yet ported calls it with its show…Modal flag.
//  - When the count goes from 0 to 1, toasts already on screen are dismissed (sonner `toast.dismiss()`), so a toast
//    created a moment before never sits unannounced behind an aria-modal dialog.
//  - `isAnyDialogOpen()` is read synchronously by the store's notify() router (increment 2), which is why the counter
//    is a tiny external store rather than React state: a store handler can read it without a hook or a re-render.
import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";

let openCount = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach(listener => listener());

export function useRegisterOpenDialog(open: boolean) {
  useEffect(() => {
    if (!open) return;
    if (openCount === 0) toast.dismiss();
    openCount += 1;
    emit();
    return () => {
      openCount = Math.max(0, openCount - 1);
      emit();
    };
  }, [open]);
}

export const isAnyDialogOpen = () => openCount > 0;

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/** The number of open dialogs, for components that must react to it (e.g. deferring a toast until close). */
export function useOpenDialogCount() {
  return useSyncExternalStore(subscribe, () => openCount, () => 0);
}
