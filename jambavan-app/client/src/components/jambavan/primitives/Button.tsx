// Button and IconButton (§3.5). Variants: primary, secondary, ghost, danger. Sizes: sm 36 px (desktop dense rows;
// 44 px below 1024 px so tap targets stay ≥ 44 px, AC-9.2), md 44 px (default), lg 52 px (hero).
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-jb-md border border-transparent",
    "font-sans text-[15px] font-semibold leading-none select-none",
    "transition-[background-color,box-shadow,transform,color] duration-[var(--motion-fast)] ease-[var(--motion-ease)]",
    "active:translate-y-px [&_svg]:size-[18px] [&_svg]:shrink-0",
    "disabled:cursor-not-allowed disabled:opacity-45 aria-disabled:cursor-not-allowed aria-disabled:opacity-45",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-jb-maroon-700 text-jb-cream-50 shadow-[0_2px_6px_rgba(122,30,44,0.25)] hover:bg-jb-maroon-800",
        secondary:
          "bg-jb-white text-jb-ink border-jb-stone-500 hover:bg-jb-cream-100",
        ghost: "bg-transparent text-jb-earth-700 hover:bg-jb-cream-200",
        danger: "bg-jb-danger-700 text-jb-cream-50 hover:brightness-90",
      },
      size: {
        sm: "min-h-9 px-3 text-sm max-[1023px]:min-h-11",
        md: "min-h-11 px-[18px]",
        lg: "min-h-[52px] px-[22px] text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { icon?: ReactNode };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { className, variant, size, icon, children, type = "button", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {icon && (
          <span aria-hidden="true" className="inline-flex">
            {icon}
          </span>
        )}
        {children}
      </button>
    );
  }
);

// IconButton: 44×44, `aria-label` is required by the type (§3.5).
export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "aria-label" | "children"
> & {
  "aria-label": string;
  icon: ReactNode;
  variant?: "ghost" | "secondary";
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { className, icon, variant = "ghost", type = "button", ...props },
    ref
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-grid size-11 shrink-0 place-items-center rounded-jb-md border border-transparent text-jb-earth-700",
          "transition-colors duration-[var(--motion-fast)] hover:bg-jb-cream-200 [&_svg]:size-5",
          variant === "secondary" && "border-jb-stone-500 bg-jb-white",
          "disabled:cursor-not-allowed disabled:opacity-45",
          className
        )}
        {...props}
      >
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
      </button>
    );
  }
);
