"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Briefcase, Inbox, Plus, Archive, RotateCcw, Edit, X } from "@/components/icons";
import { fetchJobsByPoster, fetchApplicationCount, fetchArchivedJobs, updateJobStatus, deleteJob, archiveJob, restoreJob, updateJob } from "@/lib/jobs-api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toaster";
import { timeAgo } from "@/lib/utils";
import type { Job, JobStatus, JobType, WorkMode } from "@/lib/types";

export default function MyPostingsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [editForm, setEditForm] = useState<{
    title: string;
    organisation: string;
    type: JobType;
    mode: WorkMode;
    location: string;
    salary: string;
    description: string;
    externalLink: string;
    expiresAt: string;
  }>({
    title: "",
    organisation: "",
    type: "Full-time",
    mode: "On-site",
    location: "",
    salary: "",
    description: "",
    externalLink: "",
    expiresAt: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const JOB_TYPES: JobType[] = ["Full-time", "Part-time", "Contract", "Internship", "Fellowship", "Consulting"];
  const MODES: WorkMode[] = ["On-site", "Hybrid", "Remote"];

  const openEdit = (job: Job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      organisation: job.organisation,
      type: job.type,
      mode: job.mode,
      location: job.location,
      salary: job.salary || "",
      description: job.description,
      externalLink: job.externalLink || "",
      expiresAt: job.expiresAt ? new Date(job.expiresAt).toISOString().split("T")[0] : "",
    });
  };

  const closeEdit = () => {
    setEditingJob(null);
    setEditForm({
      title: "",
      organisation: "",
      type: "Full-time",
      mode: "On-site",
      location: "",
      salary: "",
      description: "",
      externalLink: "",
      expiresAt: "",
    });
  };

  const handleEditSave = async () => {
    if (!editingJob) return;
    setEditLoading(true);
    try {
      const data = {
        ...editForm,
        expiresAt: editForm.expiresAt ? new Date(editForm.expiresAt).getTime() : editingJob.expiresAt,
      };
      await updateJob(editingJob.id, data);
      setJobs((j) => j.map((x) => x.id === editingJob.id ? { ...x, ...data } : x));
      toast("Job updated", "success");
      closeEdit();
    } catch {
      toast("Failed to update job", "error");
    } finally {
      setEditLoading(false);
    }
  };

  const load = async () => {
    if (!profile) return;
    setLoading(true);
    if (tab === "active") {
      // fetchJobsByPoster returns ALL of the user's jobs (open + closed +
      // archived); the Active tab shows everything that isn't archived.
      const j = (await fetchJobsByPoster(profile.uid)).filter((x) => x.status !== "archived");
      setJobs(j);
      const entries = await Promise.all(
        j.map(async (job) => [job.id, await fetchApplicationCount(job.id, profile.uid)] as const),
      );
      setCounts(Object.fromEntries(entries));
    } else {
      const j = await fetchArchivedJobs(profile.uid);
      setJobs(j);
      const entries = await Promise.all(
        j.map(async (job) => [job.id, await fetchApplicationCount(job.id, profile.uid)] as const),
      );
      setCounts(Object.fromEntries(entries));
    }
    setLoading(false);
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [profile, tab]);

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

  const handleArchive = async (job: Job) => {
    const prev = job.status;
    setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, status: "archived" as const } : x)));
    try {
      await archiveJob(job.id);
      toast("Job archived", "success");
      load(); // refresh to move to archived tab
    } catch {
      setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, status: prev } : x)));
      toast("Failed to archive", "error");
    }
  };

  const handleRestore = async (job: Job) => {
    const prev = job.status;
    setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, status: "open" as const } : x)));
    try {
      await restoreJob(job.id);
      toast("Job restored", "success");
      load(); // refresh to move to active tab
    } catch {
      setJobs((j) => j.map((x) => (x.id === job.id ? { ...x, status: prev } : x)));
      toast("Failed to restore", "error");
    }
  };

  return (
    <>
      <AppShell>
      {/* Editorial header band */}
      <div className="bg-navy-900 rounded-2xl p-6 mb-5 text-white border border-white/5 relative overflow-hidden flex items-center justify-between">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full border border-white/5 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border border-white/5" />
        </div>

        <div className="relative z-10">
          <span className="text-[10px] uppercase tracking-[0.2em] text-crimson font-bold block mb-1">
            Manthan Portal
          </span>
          <h1 className="font-display text-3xl font-medium tracking-tight">My postings</h1>
          <p className="text-xs text-navy-300 mt-1">
            <span className="font-bold text-crimson">{jobs.length}</span> {jobs.length === 1 ? "job" : "jobs"} you&apos;ve posted
          </p>
        </div>
        <Link href="/post" className="relative z-10">
          <Button size="sm" className="bg-white/10 text-white border-white/10 hover:bg-white/20 font-bold text-xs uppercase tracking-wider">
            <Plus width={14} height={14} /> New
          </Button>
        </Link>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 mb-4 bg-navy-50 rounded-xl p-1">
        <button
          onClick={() => setTab("active")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
            tab === "active" ? "bg-white text-navy-900 shadow-elevation-1" : "text-navy-500 hover:text-navy-700"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setTab("archived")}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-colors ${
            tab === "archived" ? "bg-white text-navy-900 shadow-elevation-1" : "text-navy-500 hover:text-navy-700"
          }`}
        >
          Archived
        </button>
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
            <Card key={job.id} accent={tab === "active" && job.status === "open" ? "green" : "none"} interactive>
              <div className="p-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/jobs/${job.id}`} className="min-w-0 flex-1">
                    <h3 className="font-bold text-navy-900 truncate text-[15px]">{job.title}</h3>
                    <p className="text-sm text-navy-500 truncate">{job.organisation} · {timeAgo(job.createdAt)}</p>
                  </Link>
                  <Badge tone={tab === "active" && job.status === "open" ? "green" : tab === "archived" ? "amber" : "gray"} dot>
                    {tab === "archived" ? "Archived" : job.status === "open" ? "Open" : "Closed"}
                  </Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {tab === "active" ? (
                    <>
                      <Link href={`/postings/${job.id}/applicants`}>
                        <Button size="sm" variant="outline" className="font-bold">
                          <Inbox width={14} height={14} /> View{counts[job.id] !== undefined ? ` (${counts[job.id]})` : ""}
                        </Button>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => toggleStatus(job)} className="font-semibold">
                        {job.status === "open" ? "Close" : "Reopen"}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(job)} className="font-semibold">
                        <Edit width={14} height={14} /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleArchive(job)} className="font-semibold">
                        <Archive width={14} height={14} /> Archive
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 font-semibold" onClick={() => remove(job)}>
                        Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleRestore(job)} className="font-semibold">
                        <RotateCcw width={14} height={14} /> Restore
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 font-semibold" onClick={() => remove(job)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>

    {/* Edit Job Dialog */}
    {editingJob && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
          <div className="p-5 border-b border-navy-100 flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-navy-900">Edit Job</h2>
            <Button variant="ghost" size="sm" onClick={closeEdit}>
              <X width={20} height={20} />
            </Button>
          </div>
          <div className="p-5 space-y-4">
            <Input label="Job title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            <Input label="Organisation" value={editForm.organisation} onChange={(e) => setEditForm({ ...editForm, organisation: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Select label="Type" value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value as JobType })}>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Select label="Work mode" value={editForm.mode} onChange={(e) => setEditForm({ ...editForm, mode: e.target.value as WorkMode })}>
                {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>
            <Input label="Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
            <Input label="Compensation (optional)" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} placeholder="e.g. ₹8–12 LPA" />
            <Input label="Expiry date" type="date" value={editForm.expiresAt} onChange={(e) => setEditForm({ ...editForm, expiresAt: e.target.value })} />
            <Textarea label="Description" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Describe the role…" />
            <Input label="External apply link (optional)" value={editForm.externalLink} onChange={(e) => setEditForm({ ...editForm, externalLink: e.target.value })} placeholder="https://…" />
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={closeEdit}>Cancel</Button>
              <Button className="flex-1 font-bold" loading={editLoading} onClick={handleEditSave}>Save changes</Button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

