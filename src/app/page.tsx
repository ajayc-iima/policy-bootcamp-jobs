"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Briefcase, Shield, Sparkle, Users, ArrowRight, ChevronRight } from "@/components/icons";

const TRUST_STATS = [
  { value: "200+", label: "Delegates & alumni" },
  { value: "100%", label: "Admin-vetted" },
  { value: "48h", label: "Avg. response time" },
];

const STEPS = [
  { num: "01", title: "Sign in with Google", desc: "One tap — no passwords to remember." },
  { num: "02", title: "Get verified", desc: "Admin confirms your delegate or alumni status." },
  { num: "03", title: "Post or apply", desc: "Share roles or find your next opportunity." },
];

const DELAYS = ["delay-0", "delay-100", "delay-200", "delay-300"];

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
    <div className="min-h-screen flex flex-col bg-navy-50 overflow-hidden">
      {/* Hero */}
      <header className="relative px-5 pt-6 pb-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 text-white font-bold shadow-elevation-1">PB</span>
          <span className="font-semibold text-navy-900 tracking-tight">Policy Bootcamp</span>
        </div>
        <Link href="/auth" className="text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors">Sign in</Link>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero section */}
        <section className={`relative px-5 pt-10 pb-12 sm:pt-16 sm:pb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
          <div className="max-w-lg mx-auto w-full text-center">
            {/* Floating badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white border border-saffron-200 px-3.5 py-1.5 text-xs font-medium text-saffron-700 mb-6 shadow-elevation-1 animate-float">
              <Sparkle width={13} height={13} /> Policy Bootcamp 2026 · Rastram
            </div>

            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-navy-900 leading-[1.1] tracking-tight">
              The job board<br />
              <span className="text-saffron-600">built on trust.</span>
            </h1>
            <p className="mt-4 text-navy-500 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
              An exclusive hiring network for Policy Bootcamp delegates & alumni. Every member verified. Every role vetted.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/auth" className="block">
                <Button size="lg" className="w-full sm:w-auto shadow-elevation-2 hover:shadow-elevation-3 transition-shadow">
                  Get started <ArrowRight width={16} height={16} />
                </Button>
              </Link>
            </div>

            {/* Trust stats */}
            <div className="mt-10 grid grid-cols-3 gap-3">
              {TRUST_STATS.map((s, i) => (
                <div key={i} className={`text-center transition-all duration-500 ${DELAYS[i]}`}>
                  <p className="text-2xl sm:text-3xl font-bold text-navy-900">{s.value}</p>
                  <p className="text-[11px] text-navy-400 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-5 py-10 bg-white border-t border-navy-100">
          <div className="max-w-lg mx-auto w-full">
            <h2 className="font-display text-xl font-semibold text-navy-900 text-center mb-8">How it works</h2>
            <div className="space-y-4">
              {STEPS.map((step, i) => (
                <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl bg-navy-50/60 border border-navy-100 transition-all duration-500 ${DELAYS[i + 1]}`}>
                  <span className="shrink-0 grid place-items-center h-10 w-10 rounded-xl bg-saffron-500 text-white text-sm font-bold">
                    {step.num}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-navy-900">{step.title}</h3>
                    <p className="text-sm text-navy-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-5 py-10">
          <div className="max-w-lg mx-auto w-full">
            <h2 className="font-display text-xl font-semibold text-navy-900 text-center mb-6">Why this exists</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Feature
                icon={<Briefcase width={20} height={20} />}
                title="Post & apply"
                desc="Dual-role: every member can both hire and seek."
              />
              <Feature
                icon={<Shield width={20} height={20} />}
                title="Verified network"
                desc="Admin-gated access means no random recruiters."
              />
              <Feature
                icon={<Users width={20} height={20} />}
                title="Same cohort"
                desc="Built for people who already share a mission."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-5 py-12">
          <div className="max-w-lg mx-auto w-full text-center">
            <div className="rounded-2xl bg-gradient-to-br from-navy-900 to-navy-800 p-8 shadow-elevation-3">
              <h2 className="font-display text-2xl font-semibold text-white">Ready to join?</h2>
              <p className="mt-2 text-navy-300 text-sm">Sign in with your Google account and get verified by the admin.</p>
              <Link href="/auth" className="inline-block mt-5">
                <Button size="lg" className="bg-saffron-500 text-white hover:bg-saffron-600 shadow-glow-saffron">
                  Continue with Google <ChevronRight width={16} height={16} />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-5 py-6 text-center text-xs text-navy-400 border-t border-navy-100">
        <p>Rastram School of Public Leadership · Rishihood University</p>
        <p className="mt-1 text-navy-300">Built for Policy Bootcamp 2026</p>
      </footer>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white border border-navy-100 p-4 shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
      <div className="text-saffron-600 mb-3">{icon}</div>
      <h3 className="text-sm font-semibold text-navy-900">{title}</h3>
      <p className="text-xs text-navy-500 mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}
