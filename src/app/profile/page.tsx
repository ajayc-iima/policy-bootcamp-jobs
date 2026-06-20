"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { doc, updateDoc } from "firebase/firestore";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Logout, Shield } from "@/components/icons";
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
      // Keep the auth context in sync so the header/avatars reflect changes.
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
      <div className="flex items-center gap-3 mb-5">
        <span className="grid place-items-center h-14 w-14 rounded-full bg-navy-900 text-white text-xl font-semibold">
          {profile.displayName?.[0]?.toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="font-semibold text-navy-900 truncate">{profile.displayName}</h1>
          <p className="text-sm text-navy-500 truncate">{profile.email}</p>
          <div className="mt-1 flex items-center gap-1.5">
            {profile.status === "active" ? <Badge tone="green">Verified</Badge> : profile.status === "rejected" ? <Badge tone="gray">Rejected</Badge> : <Badge tone="amber">{profile.status}</Badge>}
            {profile.isAdmin && <Badge tone="saffron"><Shield width={11} height={11} /> Admin</Badge>}
          </div>
        </div>
      </div>

      <Card>
        <div className="p-5">
          <h2 className="text-sm font-semibold text-navy-900 mb-4">Edit profile</h2>
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
            {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {msg && (
              <p className={`text-sm rounded-lg px-3 py-2 ${msg.ok ? "text-green-700 bg-green-50" : "text-red-600 bg-red-50"}`}>
                {msg.text}
              </p>
            )}
            <Button type="submit" loading={saving} className="w-full">Save changes</Button>
          </form>
        </div>
      </Card>

      <Card className="mt-4">
        <div className="p-5">
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={onLogout}>
            <Logout width={16} height={16} /> Sign out
          </Button>
        </div>
      </Card>

      <p className="text-center text-xs text-navy-300 mt-6">
        Policy Bootcamp 2026 · Rastram School of Public Leadership
      </p>
    </AppShell>
  );
}
