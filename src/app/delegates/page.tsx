"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Users, Search } from "@/components/icons";
import { fetchActiveUsers } from "@/lib/users-api";
import type { AppUser } from "@/lib/types";

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
      <div className="mb-3">
        <h1 className="text-xl font-semibold text-navy-900">Delegates</h1>
        <p className="text-xs text-navy-400">Connect with the Policy Bootcamp network</p>
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
                <div className="h-10 w-10 rounded-full bg-navy-100" />
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
              <Card className="hover:border-saffron-300 hover:shadow-elevation-2 transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br from-navy-800 to-navy-900 text-white text-sm font-semibold shrink-0">
                      {u.displayName[0]?.toUpperCase() ?? "?"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-navy-900 truncate">{u.displayName}</p>
                      <p className="text-xs text-navy-500 truncate">{u.organisation} · Batch {u.batch}</p>
                    </div>
                  </div>
                  {u.bio && (
                    <p className="mt-2 text-sm text-navy-600 line-clamp-2">{u.bio}</p>
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
