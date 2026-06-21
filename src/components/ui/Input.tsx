"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "@/components/icons";

const fieldBase =
  "w-full rounded-xl border-2 border-navy-200 bg-white px-4 text-navy-900 placeholder:text-navy-300 focus-ring focus:border-saffron-500 transition-colors";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, className, id, ...props }, ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-navy-800">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(fieldBase, "h-12", error && "border-red-400 focus:border-red-500", className)}
        {...props}
      />
      {hint && !error && <p className="text-xs text-navy-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
});

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, ...props }, ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-navy-800">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(fieldBase, "py-3 min-h-[120px] resize-y", error && "border-red-400", className)}
        {...props}
      />
      {hint && !error && <p className="text-xs text-navy-400">{hint}</p>}
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
});

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, className, id, children, ...props }, ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-navy-800">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={cn(fieldBase, "h-12 appearance-none bg-white pr-10 cursor-pointer", error && "border-red-400", className)}
          {...props}
        >
          {children}
        </select>
        {/* Custom chevron — appearance:none removed the native affordance (bug fix). */}
        <ChevronDown
          width={18}
          height={18}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
        />
      </div>
      {error && <p className="text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
});
