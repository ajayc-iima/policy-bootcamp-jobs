"use client";

/**
 * Mobile-first nav: a slim top bar + a fixed bottom tab bar (thumb zone).
 * On >= sm screens the bottom bar is replaced by inline top-nav links.
 */
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
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-navy-100/60">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
          <Link href="/jobs" className="flex items-center gap-2 group">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-saffron-500 to-saffron-600 text-white font-bold text-sm shadow-elevation-1 group-hover:shadow-elevation-2 transition-shadow">PB</span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-navy-900">Policy Bootcamp</p>
              <p className="text-[10px] text-navy-400 -mt-0.5">Job Portal · Rastram</p>
            </div>
          </Link>

          <div className="hidden sm:flex items-center gap-1">
            {tabs.map((t) => (
              <TabLink key={t.href} {...t} active={pathname.startsWith(t.href)} compact />
            ))}
            {isAdmin && (
              <Link href="/admin" className={cn("ml-1 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                pathname.startsWith("/admin") ? "bg-navy-900 text-white shadow-elevation-1" : "text-navy-700 hover:bg-navy-100")}>
                <Shield width={16} height={16} /> Admin
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="ml-1">
              <Logout width={16} height={16} /> Logout
            </Button>
          </div>

          {/* Mobile: avatar only (logout lives on profile screen) */}
          <Link href="/profile" className="sm:hidden">
            <span className="grid place-items-center h-9 w-9 rounded-full bg-gradient-to-br from-navy-800 to-navy-900 text-white text-sm font-semibold shadow-elevation-1 hover:shadow-elevation-2 transition-shadow">
              {profile?.displayName?.[0]?.toUpperCase() ?? "?"}
            </span>
          </Link>
        </div>
      </header>

      {/* Bottom tab bar — mobile only */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur-xl border-t border-navy-100/60 safe-bottom-nav">
        <div className="mx-auto max-w-3xl grid grid-cols-6">
          {tabs.map((t) => {
            const active = pathname.startsWith(t.href);
            const Icon = t.icon;
            if (t.highlight) {
              return (
                <Link key={t.href} href={t.href} className="flex items-center justify-center py-2">
                  <span className="grid place-items-center h-11 w-11 rounded-full bg-gradient-to-br from-saffron-500 to-saffron-600 text-white shadow-elevation-2 shadow-saffron-500/25 -mt-4 active:scale-95 transition-transform">
                    <Icon width={22} height={22} />
                  </span>
                </Link>
              );
            }
            return (
              <Link key={t.href} href={t.href}
                    className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-all duration-150",
                      active ? "text-saffron-600" : "text-navy-400 active:text-navy-600")}>
                <div className="relative">
                  <Icon width={20} height={20} />
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-saffron-500" />
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
          className={cn("inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
            active ? "bg-navy-900 text-white shadow-elevation-1" : "text-navy-700 hover:bg-navy-100", compact && "px-3")}>
      <Icon width={16} height={16} /> {label}
    </Link>
  );
}
