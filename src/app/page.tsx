"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/Footer";
import { Briefcase, Shield, Sparkle, Users, ArrowRight, ChevronRight, TrendUp } from "@/components/icons";

const TRUST_STATS = [
  { value: "200+", label: "Delegates & alumni" },
  { value: "100%", label: "Admin-vetted" },
  { value: "48h", label: "Avg. response" },
];

const STEPS = [
  { num: "01", title: "Sign in with Google", desc: "One tap — no passwords to remember." },
  { num: "02", title: "Get verified", desc: "Admin confirms your delegate or alumni status." },
  { num: "03", title: "Post or apply", desc: "Share roles or find your next opportunity." },
];

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
    <div className="min-h-screen flex flex-col bg-white overflow-hidden">
      {/* ── Hero band (full-bleed gradient color block) ─────────────────── */}
      <section className={`relative gradient-hero text-white transition-all duration-700 ${visible ? "opacity-100" : "opacity-0"}`}>
        {/* Decorative animated blobs — no external assets */}
        <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 bg-saffron-500/30 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute top-40 -left-16 h-64 w-64 bg-teal-500/20 blur-3xl animate-blob" style={{ animationDelay: "3s" }} />

        {/* Top bar */}
        <header className="relative z-10 px-5 sm:px-8 pt-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-elevation-1">
              <img src="/logo.webp" alt="Policy BootCamp" className="h-9 w-auto max-w-[200px] object-contain" />
            </span>
          </div>
          <Link href="/auth" className="text-sm font-semibold text-white/80 hover:text-white transition-colors px-4 py-2 rounded-full hover:bg-white/10">Sign in</Link>
        </header>

        <div className="relative z-10 px-5 sm:px-8 pt-10 sm:pt-16 pb-16 sm:pb-20 max-w-2xl mx-auto w-full text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur border border-white/20 px-3.5 py-1.5 text-xs font-semibold text-saffron-200 mb-6 animate-float">
            <Sparkle width={13} height={13} /> Policy BootCamp 2026 · Rashtram
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.02] tracking-tight">
            The job board<br />
            <span className="gradient-text">built on trust.</span>
          </h1>
          <p className="mt-5 text-white/70 text-base sm:text-lg leading-relaxed max-w-md mx-auto">
            An exclusive hiring network for Policy BootCamp delegates &amp; alumni. Every member verified. Every role vetted.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth" className="block">
              <Button size="lg" className="w-full sm:w-auto shadow-glow-saffron hover:shadow-glow-saffron-lg hover:scale-[1.02]">
                Get started <ArrowRight width={16} height={16} />
              </Button>
            </Link>
          </div>

          {/* Bold stat tiles */}
          <div className="mt-12 grid grid-cols-3 gap-3">
            {TRUST_STATS.map((s, i) => (
              <div key={i} className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 p-4 text-center">
                <p className="text-2xl sm:text-4xl font-black text-white tracking-tight">{s.value}</p>
                <p className="text-[11px] text-white/50 mt-1 uppercase tracking-wide font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom curve into white */}
        <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden>
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,60 L0,60 Z" fill="#ffffff" />
        </svg>
      </section>

      <main className="flex-1 flex flex-col">
        {/* How it works */}
        <section className="px-5 sm:px-8 py-12 sm:py-16">
          <div className="max-w-2xl mx-auto w-full">
            <div className="text-center mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-saffron-600">How it works</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mt-2 tracking-tight">Three steps to access</h2>
            </div>
            <div className="space-y-3">
              {STEPS.map((step, i) => (
                <div key={i} className="group flex items-center gap-5 p-5 rounded-2xl bg-white border-2 border-navy-100 hover:border-saffron-300 hover:shadow-elevation-2 transition-all duration-200">
                  <span className="shrink-0 grid place-items-center h-14 w-14 rounded-2xl gradient-saffron text-white text-lg font-black shadow-glow-saffron">
                    {step.num}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-navy-900 text-lg">{step.title}</h3>
                    <p className="text-sm text-navy-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features — colored tiles */}
        <section className="px-5 sm:px-8 pb-12 sm:pb-16">
          <div className="max-w-2xl mx-auto w-full">
            <div className="text-center mb-8">
              <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Why this exists</span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-navy-900 mt-2 tracking-tight">A network you can trust</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Feature
                icon={<Briefcase width={22} height={22} />}
                title="Post & apply"
                desc="Dual-role: every member can both hire and seek."
                tone="saffron"
              />
              <Feature
                icon={<Shield width={22} height={22} />}
                title="Verified network"
                desc="Admin-gated access means no random recruiters."
                tone="navy"
              />
              <Feature
                icon={<Users width={22} height={22} />}
                title="Same cohort"
                desc="Built for people who already share a mission."
                tone="teal"
              />
            </div>
          </div>
        </section>

        {/* CTA band */}
        <section className="px-5 sm:px-8 pb-16">
          <div className="max-w-2xl mx-auto w-full">
            <div className="relative overflow-hidden rounded-3xl gradient-hero p-8 sm:p-12 shadow-elevation-3">
              <div className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 bg-saffron-500/30 blur-3xl" />
              <div className="relative text-center">
                <TrendUp width={28} height={28} className="mx-auto text-saffron-300 mb-3" />
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">Ready to join?</h2>
                <p className="mt-3 text-white/70 text-sm max-w-sm mx-auto">Sign in with your Google account and get verified by the admin.</p>
                <Link href="/auth" className="inline-block mt-6">
                  <Button size="lg" className="shadow-glow-saffron hover:shadow-glow-saffron-lg hover:scale-[1.02]">
                    Continue with Google <ChevronRight width={16} height={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

const featureTone: Record<string, { wrap: string; icon: string }> = {
  saffron: { wrap: "from-saffron-50 to-saffron-100/40 border-saffron-200", icon: "bg-gradient-to-br from-saffron-400 to-saffron-600 text-white" },
  navy: { wrap: "from-navy-50 to-navy-100/40 border-navy-200", icon: "bg-gradient-to-br from-navy-800 to-navy-900 text-white" },
  teal: { wrap: "from-teal-50 to-teal-100/40 border-teal-200", icon: "bg-gradient-to-br from-teal-400 to-teal-600 text-white" },
};

function Feature({ icon, title, desc, tone }: { icon: React.ReactNode; title: string; desc: string; tone: "saffron" | "navy" | "teal" }) {
  const t = featureTone[tone];
  return (
    <div className={`rounded-2xl bg-gradient-to-br ${t.wrap} border-2 p-5 hover:shadow-elevation-2 transition-shadow`}>
      <div className={`grid place-items-center h-11 w-11 rounded-xl ${t.icon} shadow-elevation-1 mb-3`}>{icon}</div>
      <h3 className="font-bold text-navy-900">{title}</h3>
      <p className="text-sm text-navy-600 mt-1 leading-relaxed">{desc}</p>
    </div>
  );
}
