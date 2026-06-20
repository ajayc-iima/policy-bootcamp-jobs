"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-150 focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary: "bg-gradient-to-br from-saffron-500 to-saffron-600 text-white hover:from-saffron-600 hover:to-saffron-700 shadow-elevation-1 hover:shadow-elevation-2",
  secondary: "bg-navy-900 text-white hover:bg-navy-800 shadow-elevation-1 hover:shadow-elevation-2",
  ghost: "text-navy-700 hover:bg-navy-100",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-elevation-1",
  outline: "border border-navy-200 bg-white text-navy-800 hover:bg-navy-50 hover:border-navy-300",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", size = "md", loading, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
});
