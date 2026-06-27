"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";
import { useAuth } from "@/lib/auth-context";
import { Briefcase, Plus, Search, BookmarkFilled } from "@/components/icons";
import { fetchOpenJobs, fetchSavedJobs } from "@/lib/jobs-api";
import type { Job, JobType } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TYPES: (JobType | "All")[] = ["All", "Full-time", "Fellowship", "Internship", "Consulting", "Contract", "Part-time"];

export default function JobsPage() {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Saved" | JobType>("All");
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [loadingSaved, setLoadingSaved] = useState(false);

  useEffect(() => {
    fetchOpenJobs()
      .then(setJobs)
      .catch((err) => {
        console.error("fetchOpenJobs failed:", err);
        setJobs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Load saved jobs when profile changes
  useEffect(() => {
    if (!profile) {
      setSavedJobIds(new Set());
      return;
    }
    setLoadingSaved(true);
    fetchSavedJobs(profile.uid)
      .then((saved) => {
        console.log("Saved jobs fetched:", saved);
        setSavedJobIds(new Set(saved.map((s) => s.jobId)));
      })
      .catch((err) => {
        console.error("Failed to fetch saved jobs:", err);
        setSavedJobIds(new Set());
      })
      .finally(() => setLoadingSaved(false));
  }, [profile]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = jobs.filter((j) => {
      if (filter === "Saved" && !savedJobIds.has(j.id)) return false;
      if (filter !== "All" && filter !== "Saved" && j.type !== filter) return false;
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.organisation.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    });
    console.log("Filter:", filter, "Saved IDs:", savedJobIds, "Filtered count:", result.length);
    return result;
  }, [jobs, search, filter, savedJobIds]);

  const allFilters = useMemo(() => ["All", "Saved", ...TYPES.slice(1)] as const, []);

  return (
    <AppShell>
      {/* Editorial header band */}
      <div className="bg-navy-900 rounded-2xl p-6 mb-5 text-white border border-white/5 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full border border-white/5 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border border-white/5" />
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-crimson font-bold block mb-1">
              Manthan Portal
            </span>
            <h1 className="font-display text-3xl font-medium tracking-tight">Open roles</h1>
            <p className="text-xs text-navy-300 mt-1">
              <span className="font-bold text-crimson">{jobs.length}</span> verified {jobs.length === 1 ? "position" : "positions"} live in the network
            </p>
          </div>
          <Link href="/post" className="sm:hidden">
            <span className="inline-flex items-center gap-1 rounded-full bg-crimson text-white text-xs font-bold px-4 py-2.5 shadow-glow-saffron active:scale-95 transition-transform">
              <Plus width={14} height={14} /> Post
            </span>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
        <Input placeholder="Search role, org, location…" value={search}
               onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Pill filter chips — active = saffron fill */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5 -mx-4 px-4">
        {allFilters.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
                  className={cn("chip", filter === t && "chip-active-saffron")}>
            {t === "Saved" && !loadingSaved && <BookmarkFilled width={14} height={14} className="mr-1" />}
            {t}
          </button>
        ))}
      </div>

      {loading && jobs.length === 0 ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Briefcase width={36} height={36} />}
          title={jobs.length === 0 ? "No jobs yet" : filter === "Saved" ? "No saved jobs" : "No matches"}
          description={jobs.length === 0
            ? "Be the first to post a role for the Policy BootCamp network."
            : filter === "Saved"
              ? "Bookmark jobs to see them here."
              : "Try a different search or filter."}
          action={jobs.length === 0 ? <Link href="/post"><span className="text-saffron-700 font-bold text-sm">Post the first job →</span></Link> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((j) => <JobCard key={j.id} job={j} />)}
        </div>
      )}
    </AppShell>
  );
}
