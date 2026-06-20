"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArrowLeft, Briefcase, MapPin, Clock } from "@/components/icons";
import { fetchUser } from "@/lib/users-api";
import { fetchJobsByPoster } from "@/lib/jobs-api";
import { timeAgo, workModeTone } from "@/lib/utils";
import type { AppUser, Job } from "@/lib/types";

export default function DelegateDetailPage() {
  const params = useParams<{ uid: string }>();
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [u, j] = await Promise.all([
          fetchUser(params.uid),
          fetchJobsByPoster(params.uid),
        ]);
        setUser(u);
        setJobs(j);
      } catch (err) {
        console.error("fetch delegate failed:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.uid]);

  if (loading) return <AppShell><div className="py-16"><Spinner /></div></AppShell>;
  if (!user) return (
    <AppShell>
      <div className="text-center py-20">
        <p className="text-navy-600">Delegate not found.</p>
        <Link href="/delegates" className="text-saffron-700 font-medium mt-2 inline-block">← Back to delegates</Link>
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 mb-3">
        <ArrowLeft width={16} height={16} /> Back
      </button>

      {/* Profile card */}
      <Card>
        <div className="p-5 flex items-start gap-4">
          <span className="grid place-items-center h-14 w-14 rounded-full bg-gradient-to-br from-navy-800 to-navy-900 text-white text-xl font-semibold shrink-0 shadow-elevation-1">
            {user.displayName[0]?.toUpperCase() ?? "?"}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold text-navy-900">{user.displayName}</h1>
            <p className="text-sm text-navy-500">{user.organisation} · Batch {user.batch}</p>
            {user.bio && <p className="mt-2 text-sm text-navy-600">{user.bio}</p>}
            {user.contactLink && (
              <a href={user.contactLink} target="_blank" rel="noopener noreferrer"
                 className="inline-block mt-2 text-sm font-medium text-saffron-700 hover:underline">
                Contact → {user.contactLink.replace(/^https?:\/\//, "").split("/")[0]}
              </a>
            )}
          </div>
        </div>
      </Card>

      {/* Posted jobs */}
      <h2 className="text-sm font-semibold text-navy-800 mt-5 mb-2">
        Posted jobs <span className="text-navy-400 font-normal">({jobs.length})</span>
      </h2>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase width={28} height={28} />}
          title="No jobs posted yet"
          description="This delegate hasn't posted any jobs."
        />
      ) : (
        <div className="space-y-2">
          {jobs.map((j) => (
            <Link key={j.id} href={`/jobs/${j.id}`} className="block animate-fade-in">
              <Card className="hover:border-saffron-300 hover:shadow-elevation-2 transition-all duration-200">
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-navy-900 truncate">{j.title}</h3>
                      <p className="text-sm text-navy-500 truncate">{j.organisation}</p>
                    </div>
                    <Badge tone={j.status === "open" ? "green" : "gray"}>{j.status}</Badge>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-navy-500">
                    <span className="inline-flex items-center gap-1"><Briefcase width={13} height={13} /> {j.type}</span>
                    <span className="inline-flex items-center gap-1"><MapPin width={13} height={13} /> {j.location}</span>
                    <span className="inline-flex items-center gap-1"><Clock width={13} height={13} /> {timeAgo(j.createdAt)}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  );
}
