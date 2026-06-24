"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Footer } from "@/components/Footer";

import { ManthanLogo } from "@/components/icons";

export function AuthShell({ title, subtitle, children }: {
  title: string; subtitle?: string; children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-navy-50 text-navy-900">
      {/* Editorial header band */}
      <header className="sticky top-0 z-30 bg-navy-900/95 backdrop-blur-xl border-b border-white/5 px-5 py-3">
        <Link href="/" className="inline-flex items-center gap-2 text-white group">
          <span className="text-crimson">
            <ManthanLogo width={20} height={20} />
          </span>
          <span className="font-display font-bold text-base tracking-tight hover:opacity-90 transition-opacity">
            Manthan
          </span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col justify-center px-5 py-12">
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
