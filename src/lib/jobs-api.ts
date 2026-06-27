"use client";

/**
 * Thin data-access helpers built on Firestore. All calls inherit auth via the
 * SDK. Writes that touch more than one document are batched so partial failures
 * can't leave the data model inconsistent.
 */
import {
  collection, query, where, orderBy, getDocs, addDoc, doc, getDoc,
  setDoc, updateDoc, deleteDoc, serverTimestamp, writeBatch, Timestamp, increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Job, Application, ApplicationStatus, JobStatus, SavedJob, NewJobInput } from "@/lib/types";

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ]);
}

function toMillis(v: unknown): number {
  return v instanceof Timestamp ? v.toMillis() : (v as number);
}

/* ---------------------------- JOBS ---------------------------- */

function parseJob(id: string, data: Record<string, unknown>): Job {
  return { id, ...data, createdAt: toMillis(data.createdAt) } as unknown as Job;
}

export async function fetchOpenJobs(): Promise<Job[]> {
  const q = query(
    collection(db, "jobs"),
    where("status", "==", "open" as JobStatus),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  const jobs = snap.docs.map((d) => parseJob(d.id, d.data() as Record<string, unknown>));
  
  // Client-side fallback: filter expired and fire-and-forget update
  const now = Date.now();
  const validJobs = jobs.filter((j) => !j.expiresAt || j.expiresAt > now);
  const expiredJobs = jobs.filter((j) => j.expiresAt && j.expiresAt <= now);
  
  if (expiredJobs.length > 0) {
    const batch = writeBatch(db);
    expiredJobs.forEach((j) => 
      batch.update(doc(db, "jobs", j.id), { status: "closed", archivedAt: now })
    );
    batch.commit().catch(console.error);
  }
  
  return validJobs;
}

export async function fetchJob(id: string): Promise<Job | null> {
  const snap = await getDoc(doc(db, "jobs", id));
  if (!snap.exists()) return null;
  const job = parseJob(snap.id, snap.data() as Record<string, unknown>);
  
  // Client-side fallback: if expired but still open, update it
  if (job.status === "open" && job.expiresAt && job.expiresAt <= Date.now()) {
    const batch = writeBatch(db);
    batch.update(doc(db, "jobs", id), { status: "closed", archivedAt: Date.now() });
    batch.commit().catch(console.error);
    return null; // Treat as not available
  }
  
  return job;
}

export async function fetchJobsByPoster(uid: string): Promise<Job[]> {
  const q = query(
    collection(db, "jobs"),
    where("postedBy", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => parseJob(d.id, d.data() as Record<string, unknown>));
}

export async function createJob(input: NewJobInput): Promise<string> {
  const payload = { ...input, status: "open" as JobStatus, createdAt: serverTimestamp() };
  const ref = await withTimeout(
    addDoc(collection(db, "jobs"), payload),
    15000,
    "Firestore is taking too long. Check that the Firestore database exists in your Firebase project.",
  );
  return ref.id;
}

export async function updateJobStatus(id: string, status: JobStatus) {
  await updateDoc(doc(db, "jobs", id), { status });
}

export async function updateJob(id: string, data: Partial<Omit<Job, "id" | "postedBy" | "postedByName" | "postedByEmail" | "createdAt" | "applicantCount">>) {
  await updateDoc(doc(db, "jobs", id), data);
}

export async function deleteJob(id: string) {
  await deleteDoc(doc(db, "jobs", id));
}

/* ------------------------- APPLICATIONS ------------------------ */

function parseApplication(id: string, data: Record<string, unknown>): Application {
  return { id, ...data, createdAt: toMillis(data.createdAt) } as unknown as Application;
}

export async function fetchApplicationsForJob(jobId: string, postedBy: string): Promise<Application[]> {
  const q = query(
    collection(db, "jobs", jobId, "applications"),
    where("postedBy", "==", postedBy),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => parseApplication(d.id, d.data() as Record<string, unknown>));
}

export async function fetchMyApplications(uid: string): Promise<Application[]> {
  const q = query(
    collection(db, "applications"),
    where("applicantId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => parseApplication(d.id, d.data() as Record<string, unknown>));
}

export async function hasApplied(jobId: string, uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "jobs", jobId, "applications", uid));
  return snap.exists();
}

export async function fetchApplicationCount(jobId: string, postedBy: string): Promise<number> {
  const q = query(
    collection(db, "jobs", jobId, "applications"),
    where("postedBy", "==", postedBy),
  );
  const snap = await getDocs(q);
  return snap.size;
}

export interface NewApplicationInput {
  job: Job;
  applicantId: string; applicantName: string; applicantEmail: string; applicantBatch: string;
  coverNote: string; resumeLink: string;
}

/**
 * Three writes keep the data model consistent, done atomically in one batch:
 *   1. /jobs/{jobId}/applications/{uid}  → poster's view (only they can read it)
 *   2. /applications/{randomId}          → applicant's "my applications" list
 *   3. /jobs/{jobId}                     → increment applicant counter
 *
 * Apply-once is enforced: the application id under the job equals the uid,
 * so a second attempt overwrites (idempotent) instead of duplicating.
 */
export async function submitApplication(input: NewApplicationInput): Promise<void> {
  const { job, ...rest } = input;
  const base = {
    jobId: job.id, jobTitle: job.title, organisation: job.organisation,
    postedBy: job.postedBy,
    status: "submitted" as ApplicationStatus, createdAt: serverTimestamp(),
    ...rest,
  };

  const batch = writeBatch(db);
  // 1. Poster-facing copy (doc id = uid → apply-once).
  batch.set(doc(db, "jobs", job.id, "applications", input.applicantId), base);
  // 2. Applicant-facing copy (mirror) — created fresh each submit.
  batch.set(doc(collection(db, "applications")), base);
  // 3. Increment public counter on the job doc.
  batch.update(doc(db, "jobs", job.id), { applicantCount: increment(1) });
  await batch.commit();
}

/**
 * Update an application's status in BOTH copies at once:
 *   - the poster's copy under the job (read by the applicants page)
 *   - the applicant's mirror in /applications (read by "My Applications")
 *
 * Without the mirror update, applicants would be stuck on "submitted" forever.
 */
export async function updateApplicationStatus(
  jobId: string,
  applicantId: string,
  postedBy: string,
  status: ApplicationStatus,
): Promise<void> {
  const batch = writeBatch(db);

  // Poster-facing copy — the applicantId IS the doc id (apply-once invariant).
  batch.update(doc(db, "jobs", jobId, "applications", applicantId), { status });

  // Applicant-facing mirror — find it by postedBy + jobId + applicantId, then update.
  const mirrorQuery = query(
    collection(db, "applications"),
    where("postedBy", "==", postedBy),
    where("jobId", "==", jobId),
    where("applicantId", "==", applicantId),
  );
  const mirrorSnap = await getDocs(mirrorQuery);
  mirrorSnap.forEach((d) => batch.update(d.ref, { status }));

  await batch.commit();
}

/* ------------------------- SAVED JOBS -------------------------- */

export async function saveJob(uid: string, job: Job): Promise<void> {
  await setDoc(doc(db, "users", uid, "savedJobs", job.id), {
    jobId: job.id,
    jobTitle: job.title,
    organisation: job.organisation,
    savedAt: serverTimestamp(),
  });
}

export async function unsaveJob(uid: string, jobId: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "savedJobs", jobId));
}

export async function fetchSavedJobs(uid: string): Promise<SavedJob[]> {
  const q = query(
    collection(db, "users", uid, "savedJobs"),
    orderBy("savedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as SavedJob));
}

export async function isJobSaved(uid: string, jobId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid, "savedJobs", jobId));
  return snap.exists();
}

/* ------------------------- APPLICATION WITHDRAWAL --------------- */

export async function withdrawApplication(
  jobId: string,
  applicantId: string,
  postedBy: string
): Promise<void> {
  const batch = writeBatch(db);

  // 1. Poster-facing copy (doc id = applicantId)
  batch.update(doc(db, "jobs", jobId, "applications", applicantId), {
    status: "withdrawn" as ApplicationStatus,
  });

  // 2. Applicant-facing mirror
  const mirrorQuery = query(
    collection(db, "applications"),
    where("postedBy", "==", postedBy),
    where("jobId", "==", jobId),
    where("applicantId", "==", applicantId),
  );
  const mirrorSnap = await getDocs(mirrorQuery);
  mirrorSnap.forEach((d) => batch.update(d.ref, { status: "withdrawn" }));

  // 3. Decrement applicant counter
  batch.update(doc(db, "jobs", jobId), { applicantCount: increment(-1) });

  await batch.commit();
}

/* ------------------------- JOB ARCHIVAL ------------------------ */

export async function fetchArchivedJobs(uid: string): Promise<Job[]> {
  const q = query(
    collection(db, "jobs"),
    where("postedBy", "==", uid),
    where("status", "==", "archived" as JobStatus),
    orderBy("archivedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => parseJob(d.id, d.data() as Record<string, unknown>));
}

export async function archiveJob(id: string): Promise<void> {
  await updateDoc(doc(db, "jobs", id), {
    status: "archived" as JobStatus,
    archivedAt: serverTimestamp(),
  });
}

export async function restoreJob(id: string): Promise<void> {
  await updateDoc(doc(db, "jobs", id), {
    status: "open" as JobStatus,
    archivedAt: null,
  });
}
