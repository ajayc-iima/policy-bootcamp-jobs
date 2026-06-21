"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase, Inbox, Plus } from "@/components/icons";
import { fetchJobsByPoster, fetchApplicationCount, updateJobStatus, deleteJob } from "@/lib/jobs-api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toaster";
import { timeAgo } from "@/lib/utils";
import type { Job, JobStatus } from "@/lib/types";

export default function MyPostingsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!profile) return;
    const j = await fetchJobsByPoster(profile.uid);
    setJobs(j);
    const entries = await Promise.all(
      j.map(async (job) => [job.id, await fetchApplicationCount(job.id, profile.uid)] as const),
    );
    setCounts(Object.fromEntries(entries));
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [profile]);

  const toggleStatus = async (job: Job) => {
    const next: JobStatus = job.status === "open" ? "closed" : "open";
    const prev = job.status;
    setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, status: next } : x)));
    try {
      await updateJobStatus(job.id, next);
      toast(`Job ${next === "open" ? "reopened" : "closed"}`, "success");
    } catch {
      setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, status: prev } : x)));
      toast("Failed to update job status", "error");
    }
  };

  const remove = async (job: Job) => {
    if (!confirm(`Delete "${job.title}"? This cannot be undone.`)) return;
    const prev = [...jobs];
    setJobs((j) => j.filter((x) => x.id !== job.id));
    try {
      await deleteJob(job.id);
      toast("Job deleted", "success");
    } catch {
      setJobs(prev);
      toast("Failed to delete job", "error");
    }
  };

  return (
    <AppShell>
      <div className="gradient-hero rounded-2xl p-5 mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-display-sm text-white">My postings</h1>
          <p className="text-sm text-navy-200 mt-1">
            <span className="font-bold text-saffron-400">{jobs.length}</span> {jobs.length === 1 ? "job" : "jobs"} you&apos;ve posted
          </p>
        </div>
        <Link href="/post">
          <Button size="sm" className="bg-white/15 text-white border-white/20 hover:bg-white/25 font-bold">
            <Plus width={16} height={16} /> New
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-navy-100 p-4 animate-pulse">
              <div className="h-4 w-2/3 bg-navy-100 rounded" />
              <div className="h-3 w-1/3 bg-navy-100 rounded mt-2" />
              <div className="flex gap-2 mt-3">
                <div className="h-7 w-20 bg-navy-100 rounded-full" />
                <div className="h-7 w-16 bg-navy-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState icon={<Briefcase width={36} height={36} />}
                    title="No jobs posted yet"
                    description="Share a role with the Policy BootCamp network."
                    action={<Link href="/post"><Button size="sm">Post your first job</Button></Link>} />
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <Card key={job.id} accent={job.status === "open" ? "green" : "none"} interactive>
              <div className="p-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/jobs/${job.id}`} className="min-w-0 flex-1">
                    <h3 className="font-bold text-navy-900 truncate text-[15px]">{job.title}</h3>
                    <p className="text-sm text-navy-500 truncate">{job.organisation} · {timeAgo(job.createdAt)}</p>
                  </Link>
                  <Badge tone={job.status === "open" ? "green" : "gray"} dot>
                    {job.status === "open" ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href={`/postings/${job.id}/applicants`}>
                    <Button size="sm" variant="outline" className="font-bold">
                      <Inbox width={14} height={14} /> View{counts[job.id] !== undefined ? ` (${counts[job.id]})` : ""}
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => toggleStatus(job)} className="font-semibold">
                    {job.status === "open" ? "Close" : "Reopen"}
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 font-semibold" onClick={() => remove(job)}>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
