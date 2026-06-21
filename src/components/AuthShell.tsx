"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Footer } from "@/components/Footer";

export function AuthShell({ title, subtitle, children }: {
  title: string; subtitle?: string; children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Gradient header band */}
      <header className="relative gradient-hero text-white px-5 pt-6 pb-2">
        <Link href="/" className="relative z-10 inline-flex items-center gap-2.5 group">
          <span className="rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-elevation-1">
            <img src="/logo.webp" alt="Policy BootCamp" className="h-9 w-auto max-w-[200px] object-contain" />
          </span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center px-5 py-10">
        <div className="max-w-md mx-auto w-full animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-navy-900 tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-navy-500">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
