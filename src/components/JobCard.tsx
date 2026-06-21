"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MapPin, Briefcase, Clock, Users, Building } from "@/components/icons";
import { timeAgo, workModeTone } from "@/lib/utils";
import type { Job } from "@/lib/types";

const typeTone: Record<string, "navy" | "saffron" | "teal"> = {
  "Full-time": "navy",
  "Fellowship": "saffron",
  "Internship": "teal",
  "Consulting": "saffron",
  "Contract": "navy",
  "Part-time": "teal",
};

export function JobCard({ job }: { job: Job }) {
  return (
    <Link href={`/jobs/${job.id}`} className="block animate-fade-in">
      <Card accent={job.status === "closed" ? "none" : (typeTone[job.type] ?? "saffron")} interactive>
        <div className="p-4 pl-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-navy-900 leading-snug text-[15px] truncate">{job.title}</h3>
              <p className="text-sm text-navy-500 truncate flex items-center gap-1 mt-0.5">
                <Building width={12} height={12} className="shrink-0 text-navy-400" /> {job.organisation}
              </p>
            </div>
            {job.status === "closed" && <Badge tone="gray">Closed</Badge>}
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
