"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Users, Search, Phone } from "@/components/icons";
import { fetchActiveUsers } from "@/lib/users-api";
import type { AppUser } from "@/lib/types";

const avatarColors = [
  "from-saffron-500 to-saffron-600",
  "from-teal-500 to-teal-600",
  "from-navy-700 to-navy-800",
  "from-green-500 to-green-600",
  "from-amber-500 to-amber-600",
];

function getAvatarColor(uid: string) {
  let hash = 0;
  for (let i = 0; i < uid.length; i++) hash = ((hash << 5) - hash + uid.charCodeAt(i)) | 0;
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default function DelegatesPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchActiveUsers()
      .then(setUsers)
      .catch((err) => console.error("fetchActiveUsers failed:", err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      u.displayName.toLowerCase().includes(q) ||
      u.organisation.toLowerCase().includes(q) ||
      u.batch.toLowerCase().includes(q)
    );
  }, [users, search]);

  return (
    <AppShell>
      {/* Editorial header band */}
      <div className="bg-navy-900 rounded-2xl p-6 mb-5 text-white border border-white/5 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full border border-white/5 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border border-white/5" />
        </div>

        <div className="relative z-10">
          <span className="text-[10px] uppercase tracking-[0.2em] text-crimson font-bold block mb-1">
            Manthan Portal
          </span>
          <h1 className="font-display text-3xl font-medium tracking-tight">Delegates</h1>
          <p className="text-xs text-navy-300 mt-1">Connect with the Policy BootCamp network</p>
        </div>
      </div>

      <div className="relative mb-4">
        <Search width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
        <Input placeholder="Search name, org, batch…" value={search}
               onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-navy-100 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-navy-100" />
                <div className="flex-1">
                  <div className="h-4 w-1/3 bg-navy-100 rounded" />
                  <div className="h-3 w-1/2 bg-navy-100 rounded mt-1.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users width={36} height={36} />}
          title={users.length === 0 ? "No delegates yet" : "No matches"}
          description={users.length === 0
            ? "Active delegates will appear here once approved."
            : "Try a different search term."}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((u) => (
            <Link key={u.uid} href={`/delegates/${u.uid}`} className="block animate-fade-in">
              <Card accent="saffron" interactive>
                <div className="p-4 pl-5">
                  <div className="flex items-center gap-3">
                    {/* Colored avatar tile */}
                    <span className={`grid place-items-center h-12 w-12 rounded-xl bg-gradient-to-br ${getAvatarColor(u.uid)} text-white text-sm font-bold shadow-elevation-1 shrink-0`}>
                      {u.displayName[0]?.toUpperCase() ?? "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-navy-900 truncate text-[15px]">{u.displayName}</p>
                      <p className="text-xs text-navy-500 truncate font-medium">{u.organisation} · Batch {u.batch}</p>
                    </div>
                  </div>
{u.bio && (
                      <p className="mt-2.5 text-sm text-navy-600 line-clamp-2 ml-[60px]">{u.bio}</p>
                    )}
                    {u.contactNumber && (
                      <a href={`tel:${u.contactNumber}`} className="ml-[60px] inline-flex items-center gap-1.5 mt-2 text-xs text-saffron-600 hover:text-saffron-700 transition-colors">
                        <Phone width={12} height={12} /> {u.contactNumber}
                      </a>
                    )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
