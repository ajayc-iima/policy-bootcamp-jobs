"use client";

import { Navbar } from "@/components/Navbar";
import { AuthGate } from "@/components/AuthGate";

/** Wrap any authenticated page: gate + nav + content. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mx-auto w-full max-w-3xl px-4 pt-5 pb-28 sm:pb-12">
          {children}
        </main>
      </div>
    </AuthGate>
  );
}
