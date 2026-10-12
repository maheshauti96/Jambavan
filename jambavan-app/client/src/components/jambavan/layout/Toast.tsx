// dismisses itself after 6 s, and a toast already on screen is cleared when a dialog opens, so it never covers or
// sits unannounced behind an aria-modal dialog. The live region stays mounted so screen readers pick up each message.
import { useEffect, useRef } from "react";
import { CheckCircle2, X } from "lucide-react";
import { useJambavan } from "../state/JambavanProvider";
import { useOpenDialogCount } from "../primitives/dialogRegistry";

const TOAST_MS = 6000;

export function Toast() {
  const { notice, setNotice } = useJambavan();
  const openDialogs = useOpenDialogCount();
  const previousOpen = useRef(openDialogs);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [notice, setNotice]);
  useEffect(() => {
    if (previousOpen.current === 0 && openDialogs > 0) setNotice("");
    previousOpen.current = openDialogs;
  }, [openDialogs, setNotice]);
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="toast-region"
    >
      {notice && (
        <div className="toast">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
