import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Accent = "saffron" | "navy" | "teal" | "green" | "red" | "amber" | "gray" | "none";

const accentBar: Record<Exclude<Accent, "none">, string> = {
  saffron: "bg-saffron-500",
  navy: "bg-navy-900",
  teal: "bg-teal-500",
  green: "bg-green-500",
  red: "bg-red-500",
  amber: "bg-amber-500",
  gray: "bg-navy-400",
};

export function Card({
  className,
  accent,
  interactive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & { accent?: Accent; interactive?: boolean }) {
  return (
    <div
      className={cn(
        "relative rounded-2xl bg-white border border-navy-100 shadow-elevation-1 overflow-hidden",
        interactive && "transition-all duration-200 hover:shadow-elevation-2 hover:-translate-y-0.5 hover:border-navy-200",
        className
      )}
      {...props}
    >
      {accent && accent !== "none" && (
        <span className={cn("absolute left-0 top-5 bottom-5 w-1 rounded-r-full", accentBar[accent])} aria-hidden />
      )}
      {props.children}
    </div>
  );
}
