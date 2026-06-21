"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Logout, Shield, Mail, Globe } from "@/components/icons";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { firebaseError } from "@/lib/firebase-errors";
import { isValidUrl } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { profile, logOut, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    displayName: profile?.displayName ?? "",
    batch: profile?.batch ?? "",
    organisation: profile?.organisation ?? "",
    bio: profile?.bio ?? "",
    contactLink: profile?.contactLink ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!profile) return null;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [k]: e.target.value }); setMsg(null);
  };

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.displayName.trim().length < 2) return setError("Name is too short");
    if (form.contactLink && !isValidUrl(form.contactLink)) return setError("Contact link must be a valid URL");

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", profile.uid), {
        displayName: form.displayName.trim(),
        batch: form.batch.trim(),
        organisation: form.organisation.trim(),
        bio: form.bio.trim(),
        contactLink: form.contactLink.trim(),
      });
      await refreshProfile();
      setMsg({ ok: true, text: "Profile updated" });
    } catch (err) {
      setMsg({ ok: false, text: firebaseError(err) });
    } finally {
      setSaving(false);
    }
  };

  const onLogout = async () => {
    await logOut();
    router.push("/auth");
  };

  return (
    <AppShell>
      {/* Banner header */}
      <div className="gradient-hero rounded-2xl p-5 mb-5">
        <div className="flex items-start gap-4">
          {/* Large avatar */}
          <span className="grid place-items-center h-16 w-16 rounded-2xl bg-white/15 text-white text-2xl font-display font-bold border-2 border-white/20 shadow-glow-saffron shrink-0">
            {profile.displayName?.[0]?.toUpperCase()}
          </span>
          <div className="min-w-0 pt-1">
            <h1 className="font-display text-display-sm text-white truncate">{profile.displayName}</h1>
            <p className="text-sm text-navy-200 truncate flex items-center gap-1.5 mt-0.5">
              <Mail width={12} height={12} /> {profile.email}
            </p>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {profile.status === "active"
                ? <Badge tone="green" dot>Verified</Badge>
                : profile.status === "rejected"
                  ? <Badge tone="gray">Rejected</Badge>
                  : <Badge tone="amber" dot>{profile.status}</Badge>}
              {profile.isAdmin && <Badge tone="saffron"><Shield width={11} height={11} /> Admin</Badge>}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <div className="p-5">
          <h2 className="text-sm font-bold text-navy-900 mb-4 uppercase tracking-wide">Edit profile</h2>
          <form onSubmit={onSave} className="space-y-4">
            <Input label="Full name" value={form.displayName} onChange={set("displayName")} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Batch" value={form.batch} onChange={set("batch")} />
              <Input label="Organisation" value={form.organisation} onChange={set("organisation")} />
            </div>
            <Textarea label="Bio / headline" value={form.bio} onChange={set("bio")}
                      placeholder="Policy analyst working on climate finance…" />
            <Input label="Contact link (LinkedIn / email)" value={form.contactLink} onChange={set("contactLink")}
                   placeholder="https://linkedin.com/in/…" />
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
            {msg && (
              <p className={`text-sm rounded-xl px-3 py-2 font-medium ${msg.ok ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
                {msg.text}
              </p>
            )}
            <Button type="submit" loading={saving} className="w-full font-bold">Save changes</Button>
          </form>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="p-5">
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50 font-bold" onClick={onLogout}>
            <Logout width={16} height={16} /> Sign out
          </Button>
        </div>
      </Card>

      <p className="text-center text-xs text-navy-300 mt-6 font-medium">
        Policy BootCamp 2026 · Rashtram School of Public Leadership
      </p>
    </AppShell>
  );
}
