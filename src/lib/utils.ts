import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ApplicationStatus, JobStatus, JobType, UserStatus, WorkMode } from "@/lib/types";

/** Merge Tailwind classes with conflict resolution. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Relative time, e.g. "3 days ago". */
export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  const mo = Math.floor(day / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(mo / 12)}y ago`;
}

/** Human-readable date. */
export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/** Basic URL check (allows drive.google.com links). */
export function isValidUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// ── Shared visual tone maps (consolidated to kill duplication) ─────────────

/** Badge tone for each application status. */
export const applicationStatusTone: Record<
  ApplicationStatus,
  "amber" | "navy" | "green" | "red" | "gray"
> = {
  submitted: "amber",
  reviewing: "navy",
  accepted: "green",
  rejected: "red",
  withdrawn: "gray",
};

/** Badge tone for each work mode. */
export const workModeTone: Record<WorkMode, "navy" | "saffron" | "green"> = {
  "On-site": "navy",
  Hybrid: "saffron",
  Remote: "green",
};

/** Badge tone for each job type. */
export const jobTypeTone: Record<JobType, "navy" | "saffron" | "green" | "amber"> = {
  "Full-time": "navy",
  "Part-time": "saffron",
  Contract: "amber",
  Internship: "green",
  Fellowship: "navy",
  Consulting: "saffron",
};

/** Badge tone for each user status. */
export const userStatusTone: Record<UserStatus, "amber" | "green" | "red" | "gray"> = {
  pending: "amber",
  active: "green",
  suspended: "red",
  rejected: "gray",
};

/** Badge tone for each job status. */
export const jobStatusTone: Record<JobStatus, "green" | "gray" | "amber"> = {
  open: "green",
  closed: "gray",
  archived: "amber",
};
