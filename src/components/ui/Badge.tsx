import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "saffron" | "teal" | "green" | "amber" | "red" | "gray";

const tones: Record<Tone, string> = {
  navy: "bg-navy-100 text-navy-800",
  saffron: "bg-saffron-100 text-saffron-800",
  teal: "bg-teal-100 text-teal-800",
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  gray: "bg-navy-100/60 text-navy-500",
};

const dotTones: Record<Tone, string> = {
  navy: "bg-navy-500",
  saffron: "bg-saffron-500",
  teal: "bg-teal-500",
  green: "bg-green-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  gray: "bg-navy-400",
};

export function Badge({
  tone = "navy",
  dot = false,
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone; dot?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotTones[tone])} aria-hidden />}
      {children}
    </span>
  );
}
