"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowLeft, Briefcase, ExternalLink, Inbox, MapPin, Clock, User, Building, Globe, Calendar } from "@/components/icons";
import { fetchJob, fetchApplicationCount } from "@/lib/jobs-api";
import { formatDate, workModeTone } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import type { Job } from "@/lib/types";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [appCount, setAppCount] = useState<number | null>(null);

  useEffect(() => {
    fetchJob(params.id)
      .then(setJob)
      .finally(() => setLoading(false));
  }, [params.id]);

  useEffect(() => {
    if (!job || !profile || profile.uid !== job.postedBy) return;
    fetchApplicationCount(job.id, profile.uid)
      .then(setAppCount)
      .catch(() => {});
  }, [job, profile]);

  if (loading) return <AppShell><div className="py-16"><Spinner /></div></AppShell>;
  if (!job) return (
    <AppShell>
      <div className="text-center py-20">
        <p className="text-navy-600">This job is no longer available.</p>
        <Link href="/jobs" className="text-saffron-700 font-bold mt-2 inline-block">← Back to jobs</Link>
      </div>
    </AppShell>
  );

  const isOwner = profile?.uid === job.postedBy;

  return (
    <AppShell>
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 mb-3 font-medium">
        <ArrowLeft width={16} height={16} /> Back
      </button>

      {/* Hero card with gradient accent */}
      <div className="rounded-2xl overflow-hidden">
        <div className="gradient-hero p-5 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Badge tone={workModeTone[job.mode]} dot>{job.mode}</Badge>
            <Badge tone="saffron">{job.type}</Badge>
            {job.status === "closed" && <Badge tone="gray">Closed</Badge>}
          </div>
          <h1 className="font-display text-display-sm text-white leading-tight">{job.title}</h1>
          <p className="text-navy-200 mt-1 flex items-center gap-1.5 font-medium">
            <Building width={14} height={14} /> {job.organisation}
          </p>
        </div>

        {/* Icon-tile meta grid */}
        <div className="bg-white border border-navy-100 border-t-0 rounded-b-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetaTile icon={<MapPin width={16} height={16} />} label="Location" value={job.location} />
          <MetaTile icon={<Briefcase width={16} height={16} />} label="Type" value={job.type} />
          {job.salary && <MetaTile icon={<span className="text-sm font-bold">₹</span>} label="Compensation" value={job.salary} />}
          <MetaTile icon={<Calendar width={16} height={16} />} label="Posted" value={formatDate(job.createdAt)} />
        </div>
      </div>

      {/* Description */}
      <Card className="mt-4">
        <div className="p-5">
          <h2 className="text-sm font-bold text-navy-900 mb-2 uppercase tracking-wide">Role description</h2>
          <p className="prose-job text-sm">{job.description}</p>
        </div>
      </Card>

      {/* Posted by */}
      <Card accent="saffron" className="mt-4">
        <div className="p-5 flex items-center gap-3 pl-5">
          <span className="grid place-items-center h-10 w-10 rounded-full bg-gradient-to-br from-saffron-500 to-saffron-600 text-white font-bold text-sm shadow-elevation-1">
            {job.postedByName?.[0]?.toUpperCase() ?? <User width={18} height={18} />}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-navy-900 truncate">Posted by {job.postedByName}</p>
            <p className="text-xs text-navy-400 truncate">Policy BootCamp network · {job.postedByEmail}</p>
          </div>
        </div>
      </Card>

      {/* Sticky CTA — offset above mobile bottom nav */}
      <div className="fixed bottom-0 inset-x-0 z-20 sm:static sm:mt-5 sm:px-0"
           style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 60px)" }}>
        <div className="bg-white/95 backdrop-blur border-t border-navy-100 sm:border sm:rounded-2xl sm:shadow-elevation-2 px-4 py-3">
          <div className="mx-auto max-w-3xl flex gap-3">
            {job.externalLink && (
              <a href={job.externalLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full font-bold">
                  <Globe width={16} height={16} /> Apply externally
                </Button>
              </a>
            )}
            {isOwner ? (
              <Link href={`/postings/${job.id}/applicants`} className="flex-1">
                <Button variant="secondary" className="w-full font-bold">
                  <Inbox width={16} height={16} />
                  {appCount !== null ? `${appCount} applicant${appCount !== 1 ? "s" : ""}` : "Applicants"}
                </Button>
              </Link>
            ) : job.status === "closed" ? (
              <Button disabled className="flex-1 font-bold">Applications closed</Button>
            ) : (
              <Link href={`/jobs/${job.id}/apply`} className="flex-1">
                <Button className="w-full font-bold" size="lg">Apply now</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function MetaTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 bg-navy-50 rounded-xl p-2.5">
      <span className="grid place-items-center h-8 w-8 rounded-lg bg-white text-saffron-600 shadow-soft shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-navy-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-bold text-navy-900 truncate">{value}</p>
      </div>
    </div>
  );
}
