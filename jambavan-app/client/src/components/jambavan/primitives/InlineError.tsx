// InlineError / ErrorState (§3.5): danger-100 panel with an alert icon and title, a short explanation and an
// optional retry. role="alert" only for errors produced by a user action; inside dialogs it sits above the sticky
// footer and focus does not move to it (the alert role announces it).
import { AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function InlineError({
  title,
  children,
  action,
  alert = true,
  className,
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  /** false for passive error states that were not caused by the user's last action */
  alert?: boolean;
  className?: string;
}) {
  return (
    <div
      role={alert ? "alert" : undefined}
      className={cn(
        "flex items-start gap-3 rounded-jb-md border border-jb-danger-700/30 bg-jb-danger-100 p-3 text-jb-ink",
        className
      )}
    >
      <AlertCircle
        aria-hidden="true"
        className="mt-0.5 size-5 shrink-0 text-jb-danger-700"
      />
      <div className="min-w-0 flex-1">
        <p className="m-0 text-[15px] font-semibold leading-[22px] text-jb-danger-700">
          {title}
        </p>
        {children && (
          <div className="mt-0.5 text-sm leading-5 text-jb-ink">{children}</div>
        )}
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}
