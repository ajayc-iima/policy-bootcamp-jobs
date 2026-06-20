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
import { Check, Inbox } from "@/components/icons";
import { fetchMyApplications } from "@/lib/jobs-api";
import { useAuth } from "@/lib/auth-context";
import { timeAgo, applicationStatusTone } from "@/lib/utils";
import type { Application } from "@/lib/types";

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
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-navy-900">My applications</h1>
        <p className="text-xs text-navy-400">Roles you&apos;ve applied to within the network</p>
      </div>

      {justApplied && (
        <Card className="mb-3 border-green-200 bg-green-50">
          <div className="p-3 flex items-center gap-2 text-sm text-green-800">
            <span className="grid place-items-center h-6 w-6 rounded-full bg-green-600 text-white"><Check width={14} height={14} /></span>
            Application submitted — good luck!
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
              <Card className="hover:border-saffron-300 transition-colors">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-navy-900 truncate">{app.jobTitle}</h3>
                      <p className="text-sm text-navy-500 truncate">{app.organisation}</p>
                    </div>
                    <Badge tone={applicationStatusTone[app.status]}>{app.status}</Badge>
                  </div>
                  <p className="text-xs text-navy-400 mt-2">Applied {timeAgo(app.createdAt)}</p>
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
  // useSearchParams must be inside Suspense in App Router.
  return (
    <Suspense fallback={<AppShell><div className="py-16"><Spinner /></div></AppShell>}>
      <ApplicationsInner />
    </Suspense>
  );
}
