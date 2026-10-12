// PersonAvatar (§3.5, F11): initials (2 letters, 13/700, ink) on a department tint with a 1.5 px gold inset ring and
// a small kolam-dot motif. A photo renders only when one is supplied (the asset manifest's avatarOverrides from
// never show a broken image. alt = the person's name, or decorative (aria-hidden) when the name is printed beside it.
import { useState } from "react";
import { cn } from "@/lib/utils";
import { initials as initialsOf } from "../state/format";

const tints: Record<string, string> = {
  Academic: "bg-jb-gold-100",
  Admissions: "bg-jb-forest-100",
  Operations: "bg-jb-blue-100",
  Marketing: "bg-jb-saffron-100",
  Leadership: "bg-jb-maroon-50",
};
const sizes = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
  xl: "size-16",
} as const;

export function PersonAvatar({
  name,
  department,
  photo,
  initials,
  size = "md",
  decorative = false,
  className,
}: {
  name: string;
  department?: string;
  photo?: string;
  /** stored initials (e.g. "YO" for the "You" alias); defaults to the name's initials */
  initials?: string;
  size?: keyof typeof sizes;
  /** true when the name is printed next to the avatar */
  decorative?: boolean;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = photo && photo !== failedSrc ? photo : undefined;
  const text = (initials || initialsOf(name)).slice(0, 2).toUpperCase();
  return (
    <span
      className={cn(
        "relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full text-[13px] font-bold leading-none text-jb-ink",
        "shadow-[inset_0_0_0_1.5px_var(--jb-gold-500)]",
        tints[department ?? ""] ?? "bg-jb-cream-200",
        sizes[size],
        className
      )}
      {...(decorative
        ? { "aria-hidden": true }
        : src
          ? {}
          : { role: "img", "aria-label": name })}
    >
      {src ? (
        <img
          src={src}
          alt={decorative ? "" : name}
          className="size-full object-cover"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <>
          <span aria-hidden="true">{text}</span>
          {/* kolam dots (decorative) */}
          <svg
            aria-hidden="true"
            focusable="false"
            viewBox="0 0 8 8"
            className="absolute bottom-[3px] right-[3px] size-2 text-jb-gold-600"
          >
            <circle cx="2" cy="2" r="0.9" fill="currentColor" />
            <circle cx="6" cy="2" r="0.9" fill="currentColor" />
            <circle cx="2" cy="6" r="0.9" fill="currentColor" />
            <circle cx="6" cy="6" r="0.9" fill="currentColor" />
          </svg>
        </>
      )}
    </span>
  );
}
