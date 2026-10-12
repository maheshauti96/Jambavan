// Field family (§3.5): label above, control, hint, error. Field wires id, htmlFor, aria-describedby and aria-invalid
// automatically through a render function. Controls are 44 px, 16 px text (no iOS zoom), 1 px stone-500 border,
// blue-700 focus border with a 15% ring, danger border on error. Selects stay native <select>.
import { AlertCircle, Check } from "lucide-react";
import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type FieldControlProps = { id: string; "aria-describedby"?: string; "aria-invalid"?: true; required?: boolean };

export function Field({ label, hint, error, required, className, children, id: idProp }: {
  label: ReactNode;
  hint?: ReactNode;
  error?: string | null;
  required?: boolean;
  className?: string;
  id?: string;
  children: (control: FieldControlProps) => ReactNode;
}) {
  const autoId = useId();
  const id = idProp ?? `f${autoId.replace(/:/g, "")}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold leading-5 text-jb-ink">
        {label}
        {required && <span aria-hidden="true" className="text-jb-danger-700"> *</span>}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined, required })}
      {hint && <p id={hintId} className="m-0 text-[13px] leading-[18px] text-jb-stone-600">{hint}</p>}
      {error && (
        <p id={errorId} className="m-0 flex items-start gap-1.5 text-sm font-medium leading-5 text-jb-danger-700">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const controlBase = [
  "block w-full rounded-jb-md border border-jb-stone-500 bg-jb-white px-3 text-base text-jb-ink",
  "placeholder:text-jb-stone-600 outline-none transition-[border-color,box-shadow] duration-[var(--motion-fast)]",
  "focus-visible:border-jb-blue-700 focus-visible:shadow-[0_0_0_3px_rgba(30,58,95,0.15)] focus-visible:outline-none",
  "aria-[invalid=true]:border-jb-danger-700 disabled:cursor-not-allowed disabled:bg-jb-cream-100",
].join(" ");

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(controlBase, "h-11", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...props }, ref) {
  return <textarea ref={ref} className={cn(controlBase, "min-h-24 resize-y py-2.5 leading-6", className)} {...props} />;
});

// Native select restyled with a CSS chevron (stroke = earth-700).
const chevron = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235A3F2E' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";
export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, style, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(controlBase, "h-11 appearance-none bg-[length:18px_18px] bg-[right_12px_center] bg-no-repeat pr-10", className)}
      style={{ backgroundImage: chevron, ...style }}
      {...props}
    />
  );
});

/** Checkbox row: 20 px box inside a 44 px clickable row. */
export function CheckboxRow({ checked, onChange, children, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3 rounded-jb-md px-2 text-[15px] text-jb-ink hover:bg-jb-cream-100", className)}>
      <input type="checkbox" checked={checked} onChange={event => onChange(event.target.checked)} className="size-5 shrink-0 accent-[var(--jb-forest-700)]" {...props} />
      <span className="min-w-0 flex-1">{children}</span>
    </label>
  );
}

/** Toggle button (Mark seen / Acknowledge, contributor parts, poll options, blocker reasons): exposes aria-pressed. */
export const ToggleButton = forwardRef<HTMLButtonElement, Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-pressed"> & { pressed: boolean; icon?: ReactNode }>(
  function ToggleButton({ pressed, icon, className, children, type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        aria-pressed={pressed}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-jb-md border px-3.5 text-[15px] font-medium transition-colors duration-[var(--motion-fast)] [&_svg]:size-4",
          pressed ? "border-jb-maroon-700 bg-jb-maroon-50 text-jb-maroon-700" : "border-jb-stone-500 bg-jb-white text-jb-ink hover:bg-jb-cream-100",
          className,
        )}
        {...props}
      >
        {pressed ? <Check aria-hidden="true" /> : icon ? <span aria-hidden="true" className="inline-flex">{icon}</span> : null}
        {children}
      </button>
    );
  },
);
