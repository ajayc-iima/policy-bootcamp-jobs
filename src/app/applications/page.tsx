"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Check, Inbox, Briefcase, X } from "@/components/icons";
import { fetchMyApplications, withdrawApplication } from "@/lib/jobs-api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toaster";
import { timeAgo, applicationStatusTone } from "@/lib/utils";
import type { Application } from "@/lib/types";

function ApplicationsInner() {
  const search = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const justApplied = search.get("applied") === "1";

  const canWithdraw = (status: string) => status === "submitted" || status === "reviewing";

  const handleWithdraw = async (app: Application) => {
    if (!confirm("Withdraw your application? This cannot be undone.")) return;
    const prevStatus = app.status;
    setApps((a) => a.map((x) => (x.id === app.id ? { ...x, status: "withdrawn" as const } : x)));
    try {
      await withdrawApplication(app.jobId, app.applicantId, app.postedBy);
      toast("Application withdrawn", "success");
    } catch {
      setApps((a) => a.map((x) => (x.id === app.id ? { ...x, status: prevStatus } : x)));
      toast("Failed to withdraw", "error");
    }
  };

  useEffect(() => {
    if (!profile) return;
    fetchMyApplications(profile.uid).then(setApps).finally(() => setLoading(false));
  }, [profile]);

  return (
    <AppShell>
      {/* Editorial header band */}
      <div className="bg-navy-900 rounded-2xl p-6 mb-5 text-white border border-white/5 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full border border-white/5 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border border-white/5" />
        </div>

        <div className="relative z-10">
          <span className="text-[10px] uppercase tracking-[0.2em] text-crimson font-bold block mb-1">
            Manthan Portal
          </span>
          <h1 className="font-display text-3xl font-medium tracking-tight">My applications</h1>
          <p className="text-xs text-navy-300 mt-1">Roles you&apos;ve applied to within the network</p>
        </div>
      </div>

      {justApplied && (
        <Card accent="green" className="mb-4">
          <div className="p-4 pl-5 flex items-center gap-2 text-sm text-green-800">
            <span className="grid place-items-center h-7 w-7 rounded-lg bg-green-600 text-white shadow-elevation-1">
              <Check width={14} height={14} />
            </span>
            <span className="font-bold">Application submitted</span> — good luck!
          </div>
        </Card>
      )}

      {loading ? (
        <div className="py-16"><Spinner /></div>
      ) : apps.length === 0 ? (
        <EmptyState icon={<Inbox width={36} height={36} />}
                    title="No applications yet"
                    description="When you apply to a role, it'll show up here with its status."
                    action={<Link href="/jobs"><Button size="sm">Browse jobs</Button></Link>} />
      ) : (
        <div className="space-y-3">
          {apps.map((app) => (
            <Link key={app.id} href={`/jobs/${app.jobId}`}>
              <Card accent={applicationStatusTone[app.status]} interactive>
                <div className="p-4 pl-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-navy-900 truncate text-[15px]">{app.jobTitle}</h3>
                      <p className="text-sm text-navy-500 truncate flex items-center gap-1 mt-0.5">
                        <Briefcase width={12} height={12} className="shrink-0" /> {app.organisation}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={applicationStatusTone[app.status]} dot>{app.status}</Badge>
                      {canWithdraw(app.status) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWithdraw(app); }}
                        >
                          <X width={14} height={14} /> Withdraw
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-navy-400 mt-2 font-medium">Applied {timeAgo(app.createdAt)}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<AppShell><div className="py-16"><Spinner /></div></AppShell>}>
      <ApplicationsInner />
    </Suspense>
  );
}
