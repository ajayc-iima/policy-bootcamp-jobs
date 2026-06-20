import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "navy" | "saffron" | "green" | "amber" | "red" | "gray";

const tones: Record<Tone, string> = {
  navy: "bg-navy-100 text-navy-800",
  saffron: "bg-saffron-100 text-saffron-800",
  green: "bg-green-100 text-green-800",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-700",
  gray: "bg-navy-100/60 text-navy-500",
};

export function Badge({ tone = "navy", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
