"use client";

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white mt-auto">
      <div className="mx-auto max-w-3xl px-5 py-8 text-center">
        <div className="mb-4">
          <span className="rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-elevation-1 inline-block">
            <img src="/logo.webp" alt="Policy BootCamp" className="h-9 w-auto max-w-[200px] object-contain" />
          </span>
        </div>
        <p className="text-navy-300 text-sm font-medium">व्यक्ति | विचार | व्यवस्था</p>
        <p className="text-navy-400 text-xs mt-1">Policy BootCamp 2026 · Rashtram School of Public Leadership</p>
        <div className="border-t border-white/10 mt-5 pt-4 text-xs text-navy-400">
          © 2026 Rishihood University. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
