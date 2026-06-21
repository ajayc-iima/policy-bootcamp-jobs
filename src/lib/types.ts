/** Domain types — shared across client + security rules. Keep in sync. */

export type UserStatus = "pending" | "active" | "suspended" | "rejected";

export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  /** Policy BootCamp batch, e.g. "2024", "2025". */
  batch: string;
  /** Current organisation / affiliation. */
  organisation: string;
  /** Short bio / headline. */
  bio?: string;
  /** Public contact link (LinkedIn, email, etc.). */
  contactLink?: string;
  status: UserStatus;
  isAdmin: boolean;
  createdAt: number;
}

export type JobType = "Full-time" | "Part-time" | "Contract" | "Internship" | "Fellowship" | "Consulting";
export type WorkMode = "On-site" | "Hybrid" | "Remote";
export type JobStatus = "open" | "closed";

export interface Job {
  id: string;
  title: string;
  organisation: string;
  type: JobType;
  mode: WorkMode;
  location: string;
  salary?: string;
  description: string;
  /** External link to apply (optional — internal apply still works). */
  externalLink?: string;
  postedBy: string;       // uid
  postedByName: string;
  postedByEmail: string;
  status: JobStatus;
  createdAt: number;
  applicantCount?: number;
}

export type ApplicationStatus = "submitted" | "reviewing" | "accepted" | "rejected";

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  organisation: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  applicantBatch: string;
  coverNote: string;
  resumeLink: string;
  status: ApplicationStatus;
  createdAt: number;
}
