"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { Briefcase, Home, Inbox, Plus, User, Users, Logout, Shield } from "@/components/icons";
import { Button } from "@/components/ui/Button";

type Tab = {
  href: string;
  label: string;
  icon: typeof Home;
  highlight?: boolean;
};

const tabs: Tab[] = [
  { href: "/jobs", label: "Jobs", icon: Home },
  { href: "/delegates", label: "Delegates", icon: Users },
  { href: "/postings", label: "My Posts", icon: Briefcase },
  { href: "/post", label: "Post", icon: Plus, highlight: true },
  { href: "/applications", label: "Applied", icon: Inbox },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, isAdmin, logOut } = useAuth();

  const handleLogout = async () => {
    await logOut();
    router.push("/auth");
  };

  return (
    <>
      {/* Top bar — glassy dark for bold identity */}
      <header className="sticky top-0 z-30 bg-navy-900/90 backdrop-blur-xl border-b border-white/5">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
          <Link href="/jobs" className="flex items-center gap-2.5 group">
            <span className="rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-elevation-1">
              <img src="/logo.webp" alt="Policy BootCamp" className="h-9 w-auto max-w-[200px] object-contain" />
            </span>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {tabs.map((t) => (
              <TabLink key={t.href} {...t} active={pathname.startsWith(t.href)} compact />
            ))}
            {isAdmin && (
              <Link href="/admin" className={cn(
                "ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150",
                pathname.startsWith("/admin")
                  ? "bg-saffron-500 text-white shadow-glow-saffron"
                  : "text-navy-200 hover:bg-white/10 hover:text-white"
              )}>
                <Shield width={16} height={16} /> Admin
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-1 text-navy-200 hover:text-white hover:bg-white/10">
              <Logout width={16} height={16} />
            </Button>
          </div>

          {/* Mobile: avatar */}
          <Link href="/profile" className="sm:hidden">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-saffron-500 to-saffron-600 text-white text-sm font-bold shadow-glow-saffron active:scale-95 transition-transform">
              {profile?.displayName?.[0]?.toUpperCase() ?? "?"}
            </span>
          </Link>
        </div>
      </header>

      {/* Bottom tab bar — mobile only, bold active states */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-navy-900/95 backdrop-blur-xl border-t border-white/5 safe-bottom-nav">
        <div className="mx-auto max-w-3xl grid grid-cols-6">
          {tabs.map((t) => {
            const active = pathname.startsWith(t.href);
            const Icon = t.icon;
            if (t.highlight) {
              return (
                <Link key={t.href} href={t.href} className="flex items-center justify-center py-2">
                  <span className="grid place-items-center h-12 w-12 rounded-full bg-gradient-to-br from-saffron-500 to-saffron-600 text-white shadow-glow-saffron -mt-5 active:scale-90 transition-transform">
                    <Icon width={24} height={24} />
                  </span>
                </Link>
              );
            }
            return (
              <Link key={t.href} href={t.href}
                    className={cn(
                      "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-all duration-150",
                      active ? "text-saffron-400" : "text-navy-400 active:text-navy-200"
                    )}>
                <div className="relative">
                  <Icon width={20} height={20} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-4 rounded-full bg-saffron-400" />
                  )}
                </div>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function TabLink({ href, label, icon: Icon, active, compact }: {
  href: string; label: string; icon: typeof Home; active: boolean; compact?: boolean;
}) {
  return (
    <Link href={href}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150",
            active ? "bg-white/15 text-white shadow-elevation-1" : "text-navy-200 hover:bg-white/10 hover:text-white",
            compact && "px-3"
          )}>
      <Icon width={16} height={16} /> {label}
    </Link>
  );
}
