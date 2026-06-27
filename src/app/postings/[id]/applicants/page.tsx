"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArrowLeft, ExternalLink, Inbox, Mail } from "@/components/icons";
import { fetchApplicationsForJob, updateApplicationStatus } from "@/lib/jobs-api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toaster";
import type { Application, ApplicationStatus } from "@/lib/types";
import { timeAgo, applicationStatusTone } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STATUSES: ApplicationStatus[] = ["submitted", "reviewing", "accepted", "rejected", "withdrawn"];

export default function ApplicantsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    fetchApplicationsForJob(params.id, profile.uid).then(setApps).finally(() => setLoading(false));
  }, [params.id, profile]);

  const change = async (app: Application, status: ApplicationStatus) => {
    if (!profile) return;
    const prev = app.status;
    setApps((a) => a.map((x) => (x.id === app.id ? { ...x, status } : x)));
    try {
      await updateApplicationStatus(params.id, app.applicantId, profile.uid, status);
      toast(`Application ${status}`, "success");
    } catch {
      setApps((a) => a.map((x) => (x.id === app.id ? { ...x, status: prev } : x)));
      toast("Failed to update status", "error");
    }
  };

  return (
    <AppShell>
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 mb-3 font-medium">
        <ArrowLeft width={16} height={16} /> Back
      </button>

      <div className="gradient-hero rounded-2xl p-5 mb-5">
        <h1 className="font-display text-display-sm text-white">Applicants</h1>
        <p className="text-sm text-navy-200 mt-1">
          <span className="font-bold text-saffron-400">{apps.length}</span> {apps.length === 1 ? "application" : "applications"} so far
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border border-navy-100 p-4 animate-pulse">
              <div className="flex justify-between">
                <div className="h-4 w-1/3 bg-navy-100 rounded" />
                <div className="h-5 w-16 bg-navy-100 rounded-full" />
              </div>
              <div className="h-3 w-2/3 bg-navy-100 rounded mt-2" />
              <div className="h-16 w-full bg-navy-100 rounded mt-3" />
            </div>
          ))}
        </div>
      ) : apps.length === 0 ? (
        <EmptyState icon={<Inbox width={36} height={36} />}
                    title="No applicants yet"
                    description="When members apply, they'll appear here with their cover note and resume." />
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Card key={app.id} accent={applicationStatusTone[app.status]}>
              <div className="p-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-navy-900 text-[15px]">{app.applicantName}</h3>
                    <p className="text-xs text-navy-400 font-medium">Batch {app.applicantBatch} · {timeAgo(app.createdAt)}</p>
                  </div>
                  <Badge tone={applicationStatusTone[app.status]} dot>{app.status}</Badge>
                </div>

                <p className="mt-3 text-sm text-navy-700 whitespace-pre-wrap line-clamp-4">{app.coverNote}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={app.resumeLink} target="_blank" rel="noopener noreferrer"
                     className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-bold text-navy-700 hover:bg-navy-50 transition-colors">
                    <ExternalLink width={13} height={13} /> Resume
                  </a>
                  <a href={`mailto:${app.applicantEmail}`}
                     className="inline-flex items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-1.5 text-xs font-bold text-navy-700 hover:bg-navy-50 transition-colors">
                    <Mail width={13} height={13} /> Email
                  </a>
                </div>

                {/* Segmented status control — bold pill style */}
                <div className="mt-4 flex gap-1.5 flex-wrap">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => change(app, s)}
                            className={cn(
                              "rounded-full px-3.5 py-1.5 text-xs font-bold border transition-all duration-150",
                              app.status === s
                                ? "bg-navy-900 text-white border-navy-900 shadow-elevation-1"
                                : "bg-white text-navy-600 border-navy-200 hover:bg-navy-50 hover:border-navy-300"
                            )}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
