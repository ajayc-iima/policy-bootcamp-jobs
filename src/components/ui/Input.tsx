"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-navy-200 bg-white px-4 text-navy-900 placeholder:text-navy-300 focus-ring focus:border-saffron-500 transition-colors";

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
        <label htmlFor={id} className="block text-sm font-medium text-navy-800">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(fieldBase, "h-11", error && "border-red-400 focus:border-red-500", className)}
        {...props}
      />
      {hint && !error && <p className="text-xs text-navy-400">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
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
        <label htmlFor={id} className="block text-sm font-medium text-navy-800">
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
      {error && <p className="text-xs text-red-600">{error}</p>}
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
        <label htmlFor={id} className="block text-sm font-medium text-navy-800">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={cn(fieldBase, "h-11 appearance-none bg-white", className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
});
