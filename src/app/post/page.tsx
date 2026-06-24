"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea, Select } from "@/components/ui/Input";
import { firebaseError } from "@/lib/firebase-errors";
import { createJob } from "@/lib/jobs-api";
import { isValidUrl } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Briefcase } from "@/components/icons";
import type { JobType, WorkMode } from "@/lib/types";

const JOB_TYPES: JobType[] = ["Full-time", "Part-time", "Contract", "Internship", "Fellowship", "Consulting"];
const MODES: WorkMode[] = ["On-site", "Hybrid", "Remote"];

export default function PostJobPage() {
  const router = useRouter();
  const { profile } = useAuth();
  const [form, setForm] = useState({
    title: "", organisation: "", type: "Full-time" as JobType, mode: "On-site" as WorkMode,
    location: "", salary: "", description: "", externalLink: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value as typeof form[typeof k] });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (form.title.trim().length < 3) errs.title = "Title is too short";
    if (form.organisation.trim().length < 2) errs.organisation = "Required";
    if (form.location.trim().length < 2) errs.location = "Required";
    if (form.description.trim().length < 30) errs.description = "Describe the role in at least 30 characters";
    if (form.externalLink && !isValidUrl(form.externalLink)) errs.externalLink = "Must be a valid URL (https://…)";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      const id = await createJob({
        title: form.title.trim(),
        organisation: form.organisation.trim(),
        type: form.type,
        mode: form.mode,
        location: form.location.trim(),
        salary: form.salary.trim() || undefined,
        description: form.description.trim(),
        externalLink: form.externalLink.trim() || undefined,
        postedBy: profile!.uid,
        postedByName: profile!.displayName,
        postedByEmail: profile!.email,
      });
      router.replace(`/jobs/${id}`);
    } catch (err) {
      setErrors({ form: firebaseError(err) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppShell>
      {/* Editorial header */}
      <div className="bg-navy-900 rounded-2xl p-6 mb-5 text-white border border-white/5 relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full border border-white/5 flex items-center justify-center">
          <div className="h-24 w-24 rounded-full border border-white/5" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <span className="grid place-items-center h-10 w-10 rounded-xl bg-white/10 text-white shadow-soft">
            <Briefcase width={20} height={20} className="text-crimson" />
          </span>
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-crimson font-bold block mb-1">
              Manthan Portal
            </span>
            <h1 className="font-display text-3xl font-medium tracking-tight">Post a job</h1>
            <p className="text-xs text-navy-300 mt-1">Share a role with the Policy BootCamp network.</p>
          </div>
        </div>
      </div>

      {/* Bold grouped form */}
      <Card className="overflow-visible">
        <div className="p-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <Input id="title" label="Job title" value={form.title} onChange={set("title")}
                   error={errors.title} placeholder="e.g. Policy Analyst — Climate" />
            <Input id="org" label="Organisation" value={form.organisation} onChange={set("organisation")}
                   error={errors.organisation} placeholder="e.g. NITI Aayog / think-tank" />

            <div className="grid grid-cols-2 gap-3">
              <Select id="type" label="Type" value={form.type} onChange={set("type")}>
                {JOB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
              <Select id="mode" label="Work mode" value={form.mode} onChange={set("mode")}>
                {MODES.map((m) => <option key={m} value={m}>{m}</option>)}
              </Select>
            </div>

            <Input id="location" label="Location" value={form.location} onChange={set("location")}
                   error={errors.location} placeholder="e.g. New Delhi / Remote (India)" />
            <Input id="salary" label="Compensation (optional)" value={form.salary} onChange={set("salary")}
                   placeholder="e.g. ₹8–12 LPA" />

            <Textarea id="desc" label="Description" value={form.description} onChange={set("description")}
                      error={errors.description} hint="Responsibilities, requirements, what makes this role exciting."
                      placeholder="Describe the role…" />

            <Input id="link" label="External apply link (optional)" value={form.externalLink} onChange={set("externalLink")}
                   error={errors.externalLink} placeholder="https://…" hint="If applicants should apply on your site instead." />

            {errors.form && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{errors.form}</p>}

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" loading={submitting} className="flex-1 font-bold">Publish job</Button>
            </div>
          </form>
        </div>
      </Card>
    </AppShell>
  );
}
