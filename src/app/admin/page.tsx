"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  collection, orderBy, query, where, doc, updateDoc, writeBatch,
  onSnapshot, Timestamp, limit, startAfter, getDocs,
} from "firebase/firestore";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Check, Shield, Users, Search } from "@/components/icons";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toaster";
import { fetchStatusCounts } from "@/lib/users-api";
import type { AppUser, UserStatus } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

const PAGE_SIZE = 50;

function parseUser(d: { data: () => Record<string, unknown> }): AppUser {
  const data = d.data();
  return {
    ...data,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
  } as AppUser;
}

export default function AdminPage() {
  const { profile, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [pendingUsers, setPendingUsers] = useState<AppUser[]>([]);
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchApproving, setBatchApproving] = useState(false);
  const [lastDoc, setLastDoc] = useState<import("firebase/firestore").QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [statusCounts, setStatusCounts] = useState<Record<UserStatus, number>>({ pending: 0, active: 0, suspended: 0, rejected: 0 });
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    if (profile && !isAdmin) router.replace("/jobs");
  }, [profile, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

    // Accurate counts via aggregate queries
    fetchStatusCounts()
      .then(setStatusCounts)
      .catch(() => {})
      .finally(() => setLoadingCounts(false));

    const qPending = query(
      collection(db, "users"),
      where("status", "==", "pending"),
    );
    const unsubPending = onSnapshot(qPending, (snap) => {
      const users = snap.docs.map(parseUser).sort((a, b) => {
        const aTime = typeof a.createdAt === "number" ? a.createdAt : 0;
        const bTime = typeof b.createdAt === "number" ? b.createdAt : 0;
        return bTime - aTime;
      });
      setPendingUsers(users);
      setLoadingPending(false);
    }, (err) => {
      console.error("Pending users query failed:", err);
      setLoadingPending(false);
    });

    const qAll = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
    const unsubAll = onSnapshot(qAll, (snap) => {
      setAllUsers(snap.docs.map(parseUser));
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
      setLoadingAll(false);
    }, (err) => {
      console.error("All users query failed:", err);
      setLoadingAll(false);
    });

    return () => { unsubPending(); unsubAll(); };
  }, [isAdmin]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((u) =>
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.batch.toLowerCase().includes(q) ||
      u.organisation.toLowerCase().includes(q)
    );
  }, [allUsers, search]);

  const filteredActive = useMemo(() =>
    filteredUsers.filter((u) => u.status === "active" && u.uid !== profile?.uid),
    [filteredUsers, profile]);
  const filteredSuspended = useMemo(() =>
    filteredUsers.filter((u) => u.status === "suspended"),
    [filteredUsers]);
  const filteredRejected = useMemo(() =>
    filteredUsers.filter((u) => u.status === "rejected"),
    [filteredUsers]);

  const setStatus = async (uid: string, status: UserStatus, label: string) => {
    try {
      await updateDoc(doc(db, "users", uid), { status });
      toast(`User ${label}`, "success");
    } catch {
      toast("Failed to update user status", "error");
    }
  };

  const toggleSelect = (uid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid); else next.add(uid);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => {
      if (prev.size === pendingUsers.length) return new Set();
      return new Set(pendingUsers.map((u) => u.uid));
    });
  };

  const approveSelected = async () => {
    if (selected.size === 0) return;
    setBatchApproving(true);
    try {
      const batch = writeBatch(db);
      selected.forEach((uid) => {
        batch.update(doc(db, "users", uid), { status: "active" });
      });
      await batch.commit();
      toast(`${selected.size} user${selected.size > 1 ? "s" : ""} approved`, "success");
      setSelected(new Set());
    } catch {
      toast("Batch approval failed", "error");
    } finally {
      setBatchApproving(false);
    }
  };

  const loadMore = async () => {
    if (!lastDoc || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, "users"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      );
      const snap = await getDocs(q);
      const newUsers = snap.docs.map(parseUser);
      setAllUsers((prev) => [...prev, ...newUsers]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  if (!isAdmin) return <AppShell><div className="py-16"><Spinner /></div></AppShell>;

  return (
    <AppShell>
      {/* Editorial admin header */}
      <div className="bg-navy-900 rounded-2xl p-6 mb-5 text-white border border-white/5 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full border border-white/5 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border border-white/5" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <span className="grid place-items-center h-10 w-10 rounded-xl bg-white/10 text-white shadow-soft">
            <Shield width={20} height={20} className="text-crimson" />
          </span>
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-crimson font-bold block mb-1">
              Manthan Portal
            </span>
            <h1 className="font-display text-3xl font-medium tracking-tight">Admin</h1>
            <p className="text-xs text-navy-300 mt-1">Approve delegates & alumni, manage access</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
        <Input placeholder="Search name, email, batch, org…" value={search}
               onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Bold stat tiles — use accurate aggregate counts */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        <Stat n={loadingCounts ? "—" : statusCounts.pending} label="Pending" tone="amber" />
        <Stat n={loadingCounts ? "—" : statusCounts.active} label="Active" tone="green" />
        <Stat n={loadingCounts ? "—" : statusCounts.suspended} label="Suspended" tone="red" />
        <Stat n={loadingCounts ? "—" : statusCounts.rejected} label="Rejected" tone="gray" />
      </div>

      <div className="space-y-5">
        {/* Pending approval */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-navy-800 flex items-center gap-1.5">
              <Users width={15} height={15} className="text-navy-400" /> Pending approval{" "}
              <span className="text-navy-400 font-normal">({pendingUsers.length})</span>
            </h2>
            {pendingUsers.length > 1 && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-navy-600 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selected.size === pendingUsers.length && pendingUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-navy-300 text-saffron-600 focus:ring-saffron-500"
                  />
                  All
                </label>
                {selected.size > 0 && (
                  <Button size="sm" onClick={approveSelected} loading={batchApproving} className="font-bold">
                    <Check width={14} height={14} /> Approve {selected.size}
                  </Button>
                )}
              </div>
            )}
          </div>
          {loadingPending ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : pendingUsers.length === 0 ? (
            <p className="text-sm text-navy-400 px-1">No pending requests</p>
          ) : (
            <div className="space-y-2">
              {pendingUsers.map((u) => (
                <Card key={u.uid} accent="amber">
                  <div className="p-4 pl-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {pendingUsers.length > 1 && (
                          <input
                            type="checkbox"
                            checked={selected.has(u.uid)}
                            onChange={() => toggleSelect(u.uid)}
                            className="mt-1 rounded border-navy-300 text-saffron-600 focus:ring-saffron-500"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-navy-900 truncate">{u.displayName}</p>
                          <p className="text-xs text-navy-500 truncate font-medium">{u.email}</p>
                          <p className="text-xs text-navy-400 mt-0.5">Batch {u.batch} · {u.organisation} · joined {timeAgo(u.createdAt)}</p>
                        </div>
                      </div>
                      <Badge tone="amber" dot>{u.status}</Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => setStatus(u.uid, "active", "approved")} className="font-bold">
                        <Check width={14} height={14} /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 font-bold"
                              onClick={() => setStatus(u.uid, "rejected", "rejected")}>
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Section title="Active members" users={filteredActive} empty="No active members yet.">
          {(u) => (
            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 mt-3 font-semibold"
                    onClick={() => setStatus(u.uid, "suspended", "suspended")}>
              Suspend
            </Button>
          )}
        </Section>

        {filteredSuspended.length > 0 && (
          <Section title="Suspended" users={filteredSuspended} empty="">
            {(u) => (
              <Button size="sm" variant="outline" className="mt-3 font-bold" onClick={() => setStatus(u.uid, "active", "reinstated")}>
                Reinstate
              </Button>
            )}
          </Section>
        )}

        {filteredRejected.length > 0 && (
          <Section title="Rejected" users={filteredRejected} empty="">
            {(u) => (
              <Button size="sm" variant="outline" className="mt-3 font-bold" onClick={() => setStatus(u.uid, "active", "reinstated")}>
                Reinstate
              </Button>
            )}
          </Section>
        )}

        {hasMore && (
          <Button variant="outline" className="w-full mt-4 font-bold" onClick={loadMore} loading={loadingMore}>
            Load more ({allUsers.length} loaded)
          </Button>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ n, label, tone }: { n: number | string; label: string; tone: "amber" | "green" | "red" | "gray" }) {
  const tones = {
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    gray: "bg-navy-50 text-navy-600 border-navy-200",
  }[tone];
  return (
    <div className={`rounded-xl ${tones} border p-3 text-center`}>
      <p className="text-2xl font-bold leading-none">{n}</p>
      <p className="text-[10px] mt-1 uppercase tracking-wide font-semibold">{label}</p>
    </div>
  );
}

function Section({ title, users, empty, children }: {
  title: string; users: AppUser[]; empty: string;
  children: (u: AppUser) => React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-bold text-navy-800 mb-2 flex items-center gap-1.5">
        <Users width={15} height={15} className="text-navy-400" /> {title} <span className="text-navy-400 font-normal">({users.length})</span>
      </h2>
      {users.length === 0 ? (
        <p className="text-sm text-navy-400 px-1">{empty}</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.uid} accent={u.status === "active" ? "green" : u.status === "suspended" ? "red" : "navy"}>
              <div className="p-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-navy-900 truncate">{u.displayName}</p>
                    <p className="text-xs text-navy-500 truncate font-medium">{u.email}</p>
                    <p className="text-xs text-navy-400 mt-0.5">Batch {u.batch} · {u.organisation} · joined {timeAgo(u.createdAt)}</p>
                  </div>
                  <Badge tone={u.status === "active" ? "green" : u.status === "pending" ? "amber" : u.status === "suspended" ? "red" : "gray"} dot>{u.status}</Badge>
                </div>
                {children(u)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
