"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toaster";
import { MapPin, Briefcase, Clock, Users, Building, Bookmark, BookmarkFilled } from "@/components/icons";
import { timeAgo, workModeTone, jobTypeTone } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { saveJob, unsaveJob, isJobSaved } from "@/lib/jobs-api";
import type { Job } from "@/lib/types";

export function JobCard({ job }: { job: Job }) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [saved, setSaved] = useState(false);
  const [checking, setChecking] = useState(true);

  // Check saved state once per (profile, job) pair — never during render.
  useEffect(() => {
    let cancelled = false;
    if (!profile) { setChecking(false); return; }
    isJobSaved(profile.uid, job.id)
      .then((isSaved) => { if (!cancelled) setSaved(isSaved); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, [profile, job.id]);

  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile) return;
    const nextSaved = !saved;
    setSaved(nextSaved); // optimistic
    try {
      if (nextSaved) {
        await saveJob(profile.uid, job);
        toast("Saved", "success");
      } else {
        await unsaveJob(profile.uid, job.id);
        toast("Removed from saved", "success");
      }
    } catch {
      setSaved(!nextSaved); // rollback
      toast("Failed to update", "error");
    }
  };

  return (
    <Link href={`/jobs/${job.id}`} className="block animate-fade-in">
      <Card accent={job.status === "closed" ? "none" : (jobTypeTone[job.type] ?? "saffron")} interactive>
        <div className="p-4 pl-5 relative">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-navy-900 leading-snug text-[15px] truncate">{job.title}</h3>
              <p className="text-sm text-navy-500 truncate flex items-center gap-1 mt-0.5">
                <Building width={12} height={12} className="shrink-0 text-navy-400" /> {job.organisation}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {job.status === "closed" && <Badge tone="gray">Closed</Badge>}
              {profile && !checking && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1.5"
                  onClick={toggleSave}
                  aria-label={saved ? "Remove from saved" : "Save job"}
                >
                  {saved ? (
                    <BookmarkFilled width={20} height={20} className="text-saffron-500" />
                  ) : (
                    <Bookmark width={20} height={20} className="text-navy-400" />
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-navy-500">
            <span className="inline-flex items-center gap-1"><Briefcase width={13} height={13} /> {job.type}</span>
            <span className="inline-flex items-center gap-1"><MapPin width={13} height={13} /> {job.location}</span>
            <span className="inline-flex items-center gap-1"><Clock width={13} height={13} /> {timeAgo(job.createdAt)}</span>
            {job.applicantCount !== undefined && (
              <span className="inline-flex items-center gap-1"><Users width={13} height={13} /> {job.applicantCount}</span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <Badge tone={workModeTone[job.mode]} dot>{job.mode}</Badge>
            {job.salary && <Badge tone="gray">{job.salary}</Badge>}
          </div>
        </div>
      </Card>
    </Link>
  );
}
