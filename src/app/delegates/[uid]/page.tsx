"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ArrowLeft, Briefcase, MapPin, Clock, Mail, Globe, Phone } from "@/components/icons";
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
        <Link href="/delegates" className="text-saffron-700 font-bold mt-2 inline-block">← Back to delegates</Link>
      </div>
    </AppShell>
  );

  return (
    <AppShell>
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 mb-3 font-medium">
        <ArrowLeft width={16} height={16} /> Back
      </button>

      {/* Profile banner */}
      <div className="gradient-hero rounded-2xl p-5 mb-5">
        <div className="flex items-start gap-4">
          <span className="grid place-items-center h-16 w-16 rounded-2xl bg-white/15 text-white text-2xl font-display font-bold border-2 border-white/20 shadow-glow-saffron shrink-0">
            {user.displayName[0]?.toUpperCase() ?? "?"}
          </span>
          <div className="min-w-0 pt-1">
            <h1 className="font-display text-display-sm text-white">{user.displayName}</h1>
            <p className="text-sm text-navy-200">{user.organisation} · Batch {user.batch}</p>
            {user.bio && <p className="mt-2 text-sm text-navy-100 line-clamp-3">{user.bio}</p>}
            <div className="mt-3 flex flex-wrap gap-3">
              {user.contactLink && (
                <a href={user.contactLink} target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-1.5 text-sm font-bold text-saffron-400 hover:text-saffron-300 transition-colors">
                  <Globe width={13} height={13} /> {user.contactLink.replace(/^https?:\/\//, "").split("/")[0]}
                </a>
              )}
              {user.contactNumber && (
                <a href={`tel:${user.contactNumber}`} 
                   className="inline-flex items-center gap-1.5 text-sm font-bold text-saffron-400 hover:text-saffron-300 transition-colors">
                  <Phone width={13} height={13} /> {user.contactNumber}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posted jobs */}
      <h2 className="text-sm font-bold text-navy-800 mt-2 mb-3 uppercase tracking-wide">
        Posted jobs <span className="text-navy-400 font-normal">({jobs.length})</span>
      </h2>

      {jobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase width={28} height={28} />}
          title="No jobs posted yet"
          description="This delegate hasn't posted any jobs."
        />
      ) : (
        <div className="space-y-3">
          {jobs.map((j) => (
            <Link key={j.id} href={`/jobs/${j.id}`} className="block animate-fade-in">
              <Card accent="saffron" interactive>
                <div className="p-4 pl-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-navy-900 truncate text-[15px]">{j.title}</h3>
                      <p className="text-sm text-navy-500 truncate">{j.organisation}</p>
                    </div>
                    <Badge tone={j.status === "open" ? "green" : "gray"} dot>{j.status}</Badge>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-medium text-navy-500">
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
