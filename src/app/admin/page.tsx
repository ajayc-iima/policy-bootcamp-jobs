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
import { Check, Shield, Users, Search, Sparkle } from "@/components/icons";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toaster";
import type { AppUser, UserStatus } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

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
  const [backfilling, setBackfilling] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchApproving, setBatchApproving] = useState(false);

  useEffect(() => {
    if (profile && !isAdmin) router.replace("/jobs");
  }, [profile, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin) return;

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

    const PAGE_SIZE = 50;
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

  const [lastDoc, setLastDoc] = useState<import("firebase/firestore").QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;

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

  const active = useMemo(() =>
    filteredUsers.filter((u) => u.status === "active" && u.uid !== profile?.uid),
    [filteredUsers, profile]);
  const suspended = useMemo(() =>
    filteredUsers.filter((u) => u.status === "suspended"),
    [filteredUsers]);
  const rejected = useMemo(() =>
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

  const backfillCounts = async () => {
    setBackfilling(true);
    let done = 0;
    try {
      const jobsSnap = await getDocs(collection(db, "jobs"));
      for (const jobDoc of jobsSnap.docs) {
        const appsSnap = await getDocs(
          collection(db, "jobs", jobDoc.id, "applications"),
        );
        if (appsSnap.size > 0) {
          await updateDoc(jobDoc.ref, { applicantCount: appsSnap.size });
        }
        done++;
      }
      toast(`Backfilled ${done} job${done !== 1 ? "s" : ""}`, "success");
    } catch (err) {
      console.error("backfill failed:", err);
      toast(`Failed after ${done} jobs`, "error");
    } finally {
      setBackfilling(false);
    }
  };

  if (!isAdmin) return <AppShell><div className="py-16"><Spinner /></div></AppShell>;

  return (
    <AppShell>
      <div className="flex items-center gap-2 mb-1">
        <Shield width={18} height={18} className="text-saffron-600" />
        <h1 className="text-xl font-semibold text-navy-900">Admin</h1>
      </div>
      <p className="text-xs text-navy-400 mb-4">Approve delegates & alumni, manage access</p>

      <div className="relative mb-4">
        <Search width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
        <Input placeholder="Search name, email, batch, org…" value={search}
               onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="grid grid-cols-4 gap-2 mb-5">
        <Stat n={pendingUsers.length} label="Pending" tone="amber" />
        <Stat n={active.length} label="Active" tone="green" />
        <Stat n={suspended.length} label="Suspended" tone="red" />
        <Stat n={rejected.length} label="Rejected" tone="gray" />
      </div>

      {/* Admin tools */}
      <div className="mb-5 p-3 rounded-xl border border-navy-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-navy-800 flex items-center gap-1.5">
              <Sparkle width={15} height={15} className="text-saffron-600" /> Tools
            </p>
            <p className="text-xs text-navy-400 mt-0.5">Backfill applicant counts for existing jobs.</p>
          </div>
          <Button size="sm" onClick={backfillCounts} loading={backfilling}>
            <Sparkle width={14} height={14} /> Backfill
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-navy-800 flex items-center gap-1.5">
              <Users width={15} height={15} className="text-navy-400" /> Pending approval{" "}
              <span className="text-navy-400">({pendingUsers.length})</span>
            </h2>
            {pendingUsers.length > 1 && (
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-xs text-navy-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selected.size === pendingUsers.length && pendingUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-navy-300 text-saffron-600 focus:ring-saffron-500"
                  />
                  All
                </label>
                {selected.size > 0 && (
                  <Button size="sm" onClick={approveSelected} loading={batchApproving}>
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
                <Card key={u.uid}>
                  <div className="p-4">
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
                          <p className="font-medium text-navy-900 truncate">{u.displayName}</p>
                          <p className="text-xs text-navy-500 truncate">{u.email}</p>
                          <p className="text-xs text-navy-400 mt-0.5">Batch {u.batch} · {u.organisation} · joined {timeAgo(u.createdAt)}</p>
                        </div>
                      </div>
                      <Badge tone="amber">{u.status}</Badge>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" onClick={() => setStatus(u.uid, "active", "approved")}>
                        <Check width={14} height={14} /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
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

        <Section title="Active members" users={active} empty="No active members yet.">
          {(u) => (
            <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 mt-3"
                    onClick={() => setStatus(u.uid, "suspended", "suspended")}>
              Suspend
            </Button>
          )}
        </Section>

        {suspended.length > 0 && (
          <Section title="Suspended" users={suspended} empty="">
            {(u) => (
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setStatus(u.uid, "active", "reinstated")}>
                Reinstate
              </Button>
            )}
          </Section>
        )}

        {rejected.length > 0 && (
          <Section title="Rejected" users={rejected} empty="">
            {(u) => (
              <Button size="sm" variant="outline" className="mt-3" onClick={() => setStatus(u.uid, "active", "reinstated")}>
                Reinstate
              </Button>
            )}
          </Section>
        )}

        {hasMore && (
          <Button variant="outline" className="w-full mt-4" onClick={loadMore} loading={loadingMore}>
            Load more ({allUsers.length} loaded)
          </Button>
        )}
      </div>
    </AppShell>
  );
}

function Stat({ n, label, tone }: { n: number; label: string; tone: "amber" | "green" | "red" | "gray" }) {
  const ring = { amber: "bg-amber-50 text-amber-700", green: "bg-green-50 text-green-700", red: "bg-red-50 text-red-700", gray: "bg-navy-100 text-navy-600" }[tone];
  return (
    <div className={`rounded-xl ${ring} p-3 text-center`}>
      <p className="text-2xl font-semibold leading-none">{n}</p>
      <p className="text-[10px] mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

function Section({ title, users, empty, children }: {
  title: string; users: AppUser[]; empty: string;
  children: (u: AppUser) => React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-navy-800 mb-2 flex items-center gap-1.5">
        <Users width={15} height={15} className="text-navy-400" /> {title} <span className="text-navy-400">({users.length})</span>
      </h2>
      {users.length === 0 ? (
        <p className="text-sm text-navy-400 px-1">{empty}</p>
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.uid}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-navy-900 truncate">{u.displayName}</p>
                    <p className="text-xs text-navy-500 truncate">{u.email}</p>
                    <p className="text-xs text-navy-400 mt-0.5">Batch {u.batch} · {u.organisation} · joined {timeAgo(u.createdAt)}</p>
                  </div>
                  <Badge tone={u.status === "active" ? "green" : u.status === "pending" ? "amber" : "red"}>{u.status}</Badge>
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
