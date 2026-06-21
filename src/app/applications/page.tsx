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
import { Check, Inbox, Briefcase } from "@/components/icons";
import { fetchMyApplications } from "@/lib/jobs-api";
import { useAuth } from "@/lib/auth-context";
import { timeAgo, applicationStatusTone } from "@/lib/utils";
import type { Application } from "@/lib/types";

const statusAccent: Record<string, "saffron" | "navy" | "green" | "red"> = {
  submitted: "saffron",
  reviewing: "navy",
  accepted: "green",
  rejected: "red",
};

function ApplicationsInner() {
  const search = useSearchParams();
  const router = useRouter();
  const { profile } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const justApplied = search.get("applied") === "1";

  useEffect(() => {
    if (!profile) return;
    fetchMyApplications(profile.uid).then(setApps).finally(() => setLoading(false));
  }, [profile]);

  return (
    <AppShell>
      <div className="gradient-hero rounded-2xl p-5 mb-5">
        <h1 className="font-display text-display-sm text-white">My applications</h1>
        <p className="text-sm text-navy-200 mt-1">Roles you&apos;ve applied to within the network</p>
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
              <Card accent={statusAccent[app.status] ?? "saffron"} interactive>
                <div className="p-4 pl-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-navy-900 truncate text-[15px]">{app.jobTitle}</h3>
                      <p className="text-sm text-navy-500 truncate flex items-center gap-1 mt-0.5">
                        <Briefcase width={12} height={12} className="shrink-0" /> {app.organisation}
                      </p>
                    </div>
                    <Badge tone={applicationStatusTone[app.status]} dot>{app.status}</Badge>
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
