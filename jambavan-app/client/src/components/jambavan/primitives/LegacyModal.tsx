// Keyboard and focus behavior shared by dialogs and the mobile menu.
import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";
import { useRegisterOpenDialog } from "./dialogRegistry";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])';
const FIELD =
  'input:not([disabled]):not([type="hidden"]):not([type="file"]):not([type="checkbox"]):not([readonly]), select:not([disabled]), textarea:not([disabled])';

// The stack of open layers, top-most last. Only the top layer traps focus and handles Escape.
const stack: RefObject<HTMLElement | null>[] = [];

const visible = (el: HTMLElement) =>
  el.offsetParent !== null || getComputedStyle(el).position === "fixed";
const focusables = (root: HTMLElement) =>
  [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(visible);
// A Radix layer (ConfirmDialog, Popover…) opened on top of a legacy modal owns focus and Escape while it is open.
const radixLayerOpen = () =>
  !!document.querySelector(
    '[role="alertdialog"][data-state="open"], [data-radix-popper-content-wrapper]'
  );

export function useModalLayer(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
  initialFocus: "field" | "first" = "field"
) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  // The trigger is read during the render that opens the layer, before an autoFocus field inside it takes focus.
  const triggerRef = useRef<HTMLElement | null>(null);
  const wasOpen = useRef(false);
  if (open && !wasOpen.current && typeof document !== "undefined")
    triggerRef.current =
      document.activeElement instanceof HTMLElement &&
      document.activeElement !== document.body
        ? document.activeElement
        : null;
  wasOpen.current = open;
  useEffect(() => {
    if (!open) return;
    const root = ref.current;
    if (!root) return;
    const trigger = triggerRef.current;
    stack.push(ref);
    const isTop = () => stack[stack.length - 1] === ref;
    if (!root.contains(document.activeElement)) {
      const target =
        root.querySelector<HTMLElement>('[aria-invalid="true"]') ??
        (initialFocus === "field"
          ? root.querySelector<HTMLElement>(FIELD)
          : null) ??
        focusables(root)[0] ??
        root;
      target.focus({ preventScroll: false });
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isTop() || radixLayerOpen()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables(root);
      if (items.length === 0) {
        event.preventDefault();
        root.focus();
        return;
      }
      const first = items[0],
        last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (event.shiftKey && (active === first || !root.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (
        !event.shiftKey &&
        (active === last || !root.contains(active))
      ) {
        event.preventDefault();
        first.focus();
      }
    };
    // Focus that lands outside (a click on the page behind, a programmatic focus) is pulled back in.
    const onFocusIn = (event: FocusEvent) => {
      if (!isTop() || radixLayerOpen()) return;
      const target = event.target as Node | null;
      if (
        target &&
        !root.contains(target) &&
        !(target as HTMLElement).closest?.(
          '[role="alertdialog"], [data-sonner-toaster]'
        )
      )
        (focusables(root)[0] ?? root).focus();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("focusin", onFocusIn);
      const index = stack.indexOf(ref);
      if (index >= 0) stack.splice(index, 1);
      // Return focus to the trigger if it is still in the document (React may have re-rendered it).
      if (trigger && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    };
  }, [open, ref, initialFocus]);
}

export function LegacyModal({
  onClose,
  className,
  children,
  label,
}: {
  onClose: () => void;
  className: string;
  children: ReactNode;
  label?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useRegisterOpenDialog(true);
  useModalLayer(ref, true, onClose);
  // Name the dialog from its first heading (every legacy modal has one in `.modal-head`).
  useEffect(() => {
    const heading =
      ref.current?.querySelector<HTMLElement>(".modal-head h2, h2");
    if (!heading || label) return;
    if (!heading.id) heading.id = titleId;
    ref.current?.setAttribute("aria-labelledby", heading.id);
  }, [label, titleId]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={ref}
        className={className}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        onClick={event => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
