"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { ArrowLeft, Check, X } from "@/components/icons";
import { fetchJob, hasApplied, submitApplication, withdrawApplication } from "@/lib/jobs-api";
import { firebaseError } from "@/lib/firebase-errors";
import { isValidUrl } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toaster";
import type { Job } from "@/lib/types";

export default function ApplyPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [resumeLink, setResumeLink] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const j = await fetchJob(params.id);
      setJob(j);
      if (j && profile) setAlreadyApplied(await hasApplied(j.id, profile.uid));
      setLoading(false);
    })();
  }, [params.id, profile]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!job || !profile) return;
    const errs: Record<string, string> = {};
    if (coverNote.trim().length < 20) errs.coverNote = "Tell the poster why you're a fit (min 20 characters)";
    if (!isValidUrl(resumeLink)) errs.resumeLink = "Paste a valid link to your CV/resume (Google Drive, Dropbox, etc.)";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await submitApplication({
        job,
        applicantId: profile.uid,
        applicantName: profile.displayName,
        applicantEmail: profile.email,
        applicantBatch: profile.batch,
        coverNote: coverNote.trim(),
        resumeLink: resumeLink.trim(),
      });
      router.replace("/applications?applied=1");
    } catch (err) {
      setErrors({ form: firebaseError(err) });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <AppShell><div className="py-16"><Spinner /></div></AppShell>;
  if (!job) return (
    <AppShell>
      <p className="text-center text-navy-600 py-20">This job is no longer available.</p>
    </AppShell>
  );

  if (alreadyApplied) {
    const handleWithdraw = async () => {
      if (!job || !profile) return;
      if (!confirm("Withdraw your application? This cannot be undone.")) return;
      try {
        await withdrawApplication(job.id, profile.uid, job.postedBy);
        toast("Application withdrawn", "success");
        router.replace("/applications");
      } catch {
        toast("Failed to withdraw", "error");
      }
    };

    return (
      <AppShell>
        <div className="text-center py-16">
          <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-green-100 text-green-600 mb-4">
            <Check width={28} height={28} />
          </div>
          <h1 className="text-xl font-semibold text-navy-900">You&apos;ve applied</h1>
          <p className="mt-2 text-sm text-navy-500 max-w-xs mx-auto">
            You already applied to <span className="font-medium text-navy-700">{job.title}</span>. The poster will reach out via your contact details.
          </p>
          <div className="mt-6 flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push("/applications")}>
              View my applications
            </Button>
            <Button variant="danger" onClick={handleWithdraw}>
              <X width={16} height={16} /> Withdraw
            </Button>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800 mb-3">
        <ArrowLeft width={16} height={16} /> Back
      </button>

      <div className="mb-4">
        <h1 className="text-xl font-semibold text-navy-900">Apply to {job.title}</h1>
        <p className="text-sm text-navy-500">{job.organisation}</p>
      </div>

      <Card><div className="p-5">
        <form onSubmit={onSubmit} className="space-y-4">
          <Input label="Your name" value={profile?.displayName ?? ""} disabled
                 hint="From your profile — edit it on the Profile tab." />
          <Textarea label="Cover note" value={coverNote} onChange={(e) => setCoverNote(e.target.value)}
                    error={errors.coverNote}
                    placeholder="Why are you a strong fit? Reference a relevant project or policy interest…"
                    hint="Keep it crisp — 2–4 short paragraphs." />
          <Input label="Resume / CV link" value={resumeLink} onChange={(e) => setResumeLink(e.target.value)}
                 error={errors.resumeLink} placeholder="https://drive.google.com/…"
                 hint="Upload to Drive/Dropbox, set 'anyone with link', paste here." />

          {errors.form && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errors.form}</p>}

          <Button type="submit" loading={submitting} className="w-full" size="lg">Submit application</Button>
          <p className="text-xs text-navy-400 text-center">
            Your email ({profile?.email}) and batch will be shared with the poster.
          </p>
        </form>
      </div></Card>
    </AppShell>
  );
}
