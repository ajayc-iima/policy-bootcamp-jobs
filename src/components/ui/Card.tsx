import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-navy-100/60 shadow-elevation-1",
        className
      )}
      {...props}
    />
  );
}
