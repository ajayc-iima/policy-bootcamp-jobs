"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowLeft, Briefcase, ExternalLink, Inbox, MapPin, Clock, User } from "@/components/icons";
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
        <Link href="/jobs" className="text-saffron-700 font-medium mt-2 inline-block">← Back to jobs</Link>
      </div>
    </AppShell>
  );

  const isOwner = profile?.uid === job.postedBy;

  return (
    <AppShell>
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 mb-3">
        <ArrowLeft width={16} height={16} /> Back
      </button>

      <Card>
        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Badge tone={workModeTone[job.mode]}>{job.mode}</Badge>
            <Badge tone="navy">{job.type}</Badge>
            {job.status === "closed" && <Badge tone="gray">Closed</Badge>}
          </div>
          <h1 className="font-display text-2xl font-semibold text-navy-900 leading-tight">{job.title}</h1>
          <p className="text-navy-600 mt-1">{job.organisation}</p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-navy-600">
            <Info icon={<MapPin width={15} height={15} />} label={job.location} />
            <Info icon={<Briefcase width={15} height={15} />} label={job.type} />
            {job.salary && <Info icon={<span className="font-medium text-xs">₹</span>} label={job.salary} />}
            <Info icon={<Clock width={15} height={15} />} label={`Posted ${formatDate(job.createdAt)}`} />
          </div>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="p-5">
          <h2 className="text-sm font-semibold text-navy-900 mb-2">Role description</h2>
          <p className="prose-job text-sm">{job.description}</p>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="p-5 flex items-center gap-3">
          <span className="grid place-items-center h-10 w-10 rounded-full bg-navy-100 text-navy-700">
            <User width={18} height={18} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-navy-900 truncate">Posted by {job.postedByName}</p>
            <p className="text-xs text-navy-400 truncate">Policy Bootcamp network · {job.postedByEmail}</p>
          </div>
        </div>
      </Card>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 z-20 sm:static sm:mt-4 sm:px-0"
           style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="bg-white/95 backdrop-blur border-t border-navy-100 sm:border sm:rounded-2xl sm:shadow-sm px-4 py-3">
          <div className="mx-auto max-w-3xl flex gap-3">
            {job.externalLink && (
              <a href={job.externalLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ExternalLink width={16} height={16} /> External apply
                </Button>
              </a>
            )}
            {isOwner ? (
              <Link href={`/postings/${job.id}/applicants`} className="flex-1">
                <Button variant="secondary" className="w-full">
                  <Inbox width={16} height={16} />
                  {appCount !== null ? `${appCount} applicant${appCount !== 1 ? "s" : ""}` : "Applicants"}
                </Button>
              </Link>
            ) : job.status === "closed" ? (
              <Button disabled className="flex-1">Applications closed</Button>
            ) : (
              <Link href={`/jobs/${job.id}/apply`} className="flex-1">
                <Button className="w-full" size="lg">Apply now</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function Info({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-navy-400">{icon}</span>
      <span>{label}</span>
    </div>
  );
}
