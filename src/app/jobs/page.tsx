"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { JobCard } from "@/components/JobCard";
import { JobCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toaster";
import { Briefcase, Plus, Search } from "@/components/icons";
import { fetchOpenJobs } from "@/lib/jobs-api";
import type { Job, JobType } from "@/lib/types";
import Link from "next/link";
import { cn } from "@/lib/utils";

const TYPES: (JobType | "All")[] = ["All", "Full-time", "Fellowship", "Internship", "Consulting", "Contract", "Part-time"];

export default function JobsPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<(typeof TYPES)[number]>("All");

  useEffect(() => {
    fetchOpenJobs()
      .then(setJobs)
      .catch((err) => {
        console.error("fetchOpenJobs failed:", err);
        setJobs([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((j) => {
      if (filter !== "All" && j.type !== filter) return false;
      if (!q) return true;
      return (
        j.title.toLowerCase().includes(q) ||
        j.organisation.toLowerCase().includes(q) ||
        j.location.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q)
      );
    });
  }, [jobs, search, filter]);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-semibold text-navy-900">Open roles</h1>
          <p className="text-xs text-navy-400">{jobs.length} live {jobs.length === 1 ? "job" : "jobs"} in the network</p>
        </div>
        <Link href="/post" className="sm:hidden">
          <span className="inline-flex items-center gap-1 rounded-full bg-saffron-500 text-white text-xs font-medium px-3 py-2 shadow">
            <Plus width={14} height={14} /> Post
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search width={18} height={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-300" />
        <Input placeholder="Search role, org, location…" value={search}
               onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {/* Type chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4 -mx-4 px-4">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setFilter(t)}
                  className={cn("whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium border transition-colors",
                    filter === t ? "bg-navy-900 text-white border-navy-900" : "bg-white text-navy-600 border-navy-200")}>
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
          title={jobs.length === 0 ? "No jobs yet" : "No matches"}
          description={jobs.length === 0
            ? "Be the first to post a role for the Policy Bootcamp network."
            : "Try a different search or filter."}
          action={jobs.length === 0 ? <Link href="/post"><span className="text-saffron-700 font-medium text-sm">Post the first job →</span></Link> : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((j) => <JobCard key={j.id} job={j} />)}
        </div>
      )}
    </AppShell>
  );
}
