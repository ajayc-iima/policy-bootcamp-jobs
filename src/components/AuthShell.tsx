"use client";

import Link from "next/link";
import { type ReactNode } from "react";

export function AuthShell({ title, subtitle, children }: {
  title: string; subtitle?: string; children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-navy-50 via-white to-white">
      <header className="px-5 pt-6">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 text-white font-bold text-sm shadow-elevation-1 group-hover:shadow-elevation-2 transition-shadow">PB</span>
          <span className="text-sm font-semibold text-navy-900 tracking-tight">Policy Bootcamp Jobs</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center px-5 py-8">
        <div className="max-w-md mx-auto w-full animate-fade-in">
          <h1 className="font-display text-2xl font-semibold text-navy-900 tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-navy-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
      </main>
    </div>
  );
}
