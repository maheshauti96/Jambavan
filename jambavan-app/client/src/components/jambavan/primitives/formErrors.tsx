// F10 (C9): inline validation for the legacy dialogs. Each invalid field gets aria-invalid and aria-describedby
// pointing at its message, and the first invalid field takes focus after a failed submit.
import { useState } from "react";

export function useFormErrors<K extends string>(prefix: string) {
  const [errors, setErrors] = useState<Partial<Record<K, string>>>({});
  const id = (key: K) => `${prefix}-${key}-error`;
  return {
    errors,
    /** Sets the errors; returns true when the form is valid. Focuses the first invalid field otherwise. */
    check(found: Partial<Record<K, string>>) {
      const clean = Object.fromEntries(
        Object.entries(found).filter(([, value]) => value)
      ) as Partial<Record<K, string>>;
      setErrors(clean);
      const valid = Object.keys(clean).length === 0;
      if (!valid)
        requestAnimationFrame(() =>
          document
            .querySelector<HTMLElement>('[role="dialog"] [aria-invalid="true"]')
            ?.focus()
        );
      return valid;
    },
    clear(key: K) {
      setErrors(current =>
        current[key] ? { ...current, [key]: undefined } : current
      );
    },
    reset() {
      setErrors({});
    },
    props(key: K) {
      return errors[key]
        ? { "aria-invalid": true as const, "aria-describedby": id(key) }
        : {};
    },
    message(key: K) {
      return errors[key] ? (
        <span className="field-error" id={id(key)} role="alert">
          {errors[key]}
        </span>
      ) : null;
    },
  };
}
