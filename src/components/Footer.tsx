"use client";

import { ManthanLogo } from "@/components/icons";

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white mt-auto border-t border-white/5">
      <div className="mx-auto max-w-3xl px-5 py-8 text-center">
        <div className="mb-3 flex justify-center text-crimson">
          <ManthanLogo width={28} height={28} />
        </div>
        <p className="font-display italic text-navy-300 text-sm">व्यक्ति | विचार | व्यवस्था</p>
        <p className="text-navy-400 text-xs mt-1 font-semibold tracking-wider uppercase text-[10px]">
          Policy BootCamp 2026 · Rashtram School of Public Leadership
        </p>
        <div className="border-t border-white/10 mt-5 pt-4 text-xs text-navy-500">
          © 2026 Rishihood University. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
