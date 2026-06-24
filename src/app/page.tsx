"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/Footer";
import { ManthanLogo, ArrowRight } from "@/components/icons";

export default function LandingPage() {
  const { fbUser, profile, loading } = useAuth();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!loading && fbUser && profile) {
      router.replace("/jobs");
    }
  }, [loading, fbUser, profile, router]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-navy-50 text-navy-900 transition-opacity duration-700 select-none">
      {/* Main Container */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-16 flex flex-col justify-center gap-6">
        
        {/* Top Header */}
        <header className="flex items-center justify-between py-2 mb-2 sm:mb-6">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 text-crimson">
              <ManthanLogo width={24} height={24} />
            </span>
            <span className="font-display font-semibold text-lg tracking-tight text-navy-900">Manthan</span>
          </div>
          <Link href="/auth">
            <span className="text-xs font-semibold uppercase tracking-wider text-crimson hover:opacity-80 transition-opacity">
              Sign In
            </span>
          </Link>
        </header>

        {/* Mockup Dual-Card Layout */}
        <div className={`grid grid-cols-1 md:grid-cols-5 gap-6 transition-all duration-700 transform ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          
          {/* Left Panel: The Dark Manthan Branding Card (col-span-3) */}
          <div className="md:col-span-3 rounded-2xl bg-navy-900 text-white p-8 sm:p-12 relative overflow-hidden flex flex-col justify-between min-h-[380px] sm:min-h-[440px] shadow-elevation-2 border border-white/5">
            {/* Subtle decorative concentric circles background */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-64 w-64 rounded-full border border-white/5 flex items-center justify-center">
              <div className="h-48 w-48 rounded-full border border-white/5 flex items-center justify-center">
                <div className="h-32 w-32 rounded-full border border-white/5" />
              </div>
            </div>

            <div>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-crimson font-bold block mb-8">
                Rashtram School of Public Leadership
              </span>
              <div className="flex items-center gap-4 mb-6">
                <span className="h-10 w-10 text-crimson animate-pulse">
                  <ManthanLogo width={40} height={40} />
                </span>
                <h1 className="font-display text-4xl sm:text-5xl font-medium tracking-tight">
                  Manthan
                </h1>
              </div>
              <p className="font-display italic text-lg sm:text-xl text-navy-200/90 leading-relaxed max-w-lg mt-6">
                “The churning of ideas – a digital chaupal where every Rashtram cohort can find each other, think together, and build together.”
              </p>
            </div>

            {/* Red uppercase links at the bottom */}
            <div className="mt-12 pt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-left">
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-crimson uppercase tracking-wider">People</p>
                <p className="text-[10px] text-navy-300 mt-0.5">trust-gated directory</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-crimson uppercase tracking-wider">Chaupal</p>
                <p className="text-[10px] text-navy-300 mt-0.5">think together</p>
              </div>
              <div>
                <p className="text-[10px] sm:text-xs font-bold text-crimson uppercase tracking-wider">Maidan</p>
                <p className="text-[10px] text-navy-300 mt-0.5">build together</p>
              </div>
            </div>
          </div>

          {/* Right Panel: Side Action & Cohort Cards (col-span-2) */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Launch Cohort Card */}
            <div className="rounded-2xl bg-white border border-navy-100 p-6 flex flex-col justify-between shadow-elevation-1">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-navy-400 font-bold block mb-4">
                  Launch Cohort
                </span>
                <div className="flex items-center mb-4">
                  <img src="/logo-pbc10.png" alt="PBC 10 Logo" className="h-16 w-auto object-contain" />
                </div>
              </div>
              <p className="text-sm text-navy-500 font-medium leading-relaxed">
                Phase 0 ships to the PBC 10 cohort live in residence at Sonipat.
              </p>
            </div>

            {/* Closed Circle Portal Access Card */}
            <div className="rounded-2xl bg-white border border-navy-100 p-6 flex flex-col justify-between flex-1 shadow-elevation-1">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-navy-400 font-bold block mb-3">
                  Portal Access
                </span>
                <h3 className="font-display text-lg font-bold text-navy-900 leading-tight">
                  Closed Network Jobs
                </h3>
                <p className="text-xs text-navy-500 mt-2 leading-relaxed">
                  Welcome to our private circle. This space is exclusively for members to discover public policy, research, and governance opportunities.
                </p>
              </div>
              
              <div className="mt-8">
                <Link href="/auth" className="block">
                  <Button variant="primary" className="w-full bg-crimson hover:bg-crimson/95 text-white shadow-elevation-1 py-3 text-xs uppercase tracking-wider font-bold">
                    Enter Portal <ArrowRight width={14} height={14} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
