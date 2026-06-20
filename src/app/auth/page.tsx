"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { firebaseError } from "@/lib/firebase-errors";
import { Shield, Sparkle } from "@/components/icons";

function GoogleMark() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

function AuthPageInner() {
  const router = useRouter();
  const search = useSearchParams();
  const { fbUser, profile, loading, needsProfile, signInWithGoogle, completeProfile } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && fbUser && profile && !needsProfile) {
      const dest = profile.status === "active" ? (search.get("next") || "/jobs") : null;
      if (dest) {
        router.replace(dest);
      } else if (profile.status === "pending" || profile.status === "suspended" || profile.status === "rejected") {
        router.replace("/jobs");
      }
    }
  }, [loading, fbUser, profile, needsProfile, router, search]);

  const onGoogle = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(firebaseError(err));
      setBusy(false);
    }
  };

  if (needsProfile && fbUser) {
    return (
      <ProfileCompletion
        email={fbUser.email ?? ""}
        defaultName={profile?.displayName ?? fbUser.displayName ?? ""}
        defaultBatch={profile?.batch ?? ""}
        defaultOrg={profile?.organisation ?? ""}
        submitting={busy}
        error={error}
        onSubmit={async (info) => {
          setBusy(true);
          setError(null);
          try {
            await completeProfile(info);
          } catch (err) {
            setError(firebaseError(err));
            setBusy(false);
          }
        }}
      />
    );
  }

  return (
    <AuthShell title="Welcome" subtitle="Sign in to the Policy Bootcamp network.">
      <div className="space-y-5">
        <div className="rounded-2xl border border-saffron-200 bg-saffron-50/50 p-4 shadow-elevation-1">
          <div className="flex items-start gap-3">
            <span className="grid place-items-center h-9 w-9 rounded-xl bg-white text-saffron-600 shrink-0 shadow-elevation-1">
              <Shield width={18} height={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-navy-900">Members only</p>
              <p className="text-xs text-navy-500 mt-0.5 leading-relaxed">
                Every account is admin-approved, so you always know who you&apos;re hiring — or being hired by.
              </p>
            </div>
          </div>
        </div>

        <Button variant="outline" size="lg" className="w-full" onClick={onGoogle} loading={busy}>
          {!busy && <GoogleMark />}
          Continue with Google
        </Button>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

        {loading && (
          <div className="flex justify-center pt-2"><Spinner /></div>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-navy-400">
        <span className="inline-flex items-center gap-1 justify-center">
          <Sparkle width={12} height={12} /> Policy Bootcamp 2026 · Rashtram School of Public Leadership
        </span>
      </p>
    </AuthShell>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center"><Spinner /></div>}>
      <AuthPageInner />
    </Suspense>
  );
}

function ProfileCompletion({
  email, defaultName, defaultBatch, defaultOrg, submitting, error, onSubmit,
}: {
  email: string;
  defaultName: string;
  defaultBatch: string;
  defaultOrg: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (info: { displayName: string; batch: string; organisation: string }) => void;
}) {
  const [displayName, setDisplayName] = useState(defaultName);
  const [batch, setBatch] = useState(defaultBatch);
  const [organisation, setOrganisation] = useState(defaultOrg);
  const [touched, setTouched] = useState(false);

  const nameErr = touched && displayName.trim().length < 2 ? "Please enter your full name" : undefined;
  const batchErr = touched && !batch.trim() ? "Required" : undefined;
  const orgErr = touched && !organisation.trim() ? "Required" : undefined;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (displayName.trim().length < 2 || !batch.trim() || !organisation.trim()) return;
    onSubmit({ displayName: displayName.trim(), batch: batch.trim(), organisation: organisation.trim() });
  };

  return (
    <AuthShell title="Almost there" subtitle={`Finishing your profile for ${email}`}>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Full name" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
               placeholder="Your full name" error={nameErr} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Batch year" value={batch} onChange={(e) => setBatch(e.target.value)}
                 placeholder="e.g. 2025" error={batchErr} />
          <Input label="Organisation" value={organisation} onChange={(e) => setOrganisation(e.target.value)}
                 placeholder="Current org" error={orgErr} />
        </div>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{error}</p>}
        <Button type="submit" loading={submitting} className="w-full" size="lg">
          Request access
        </Button>
        <p className="text-xs text-navy-400 text-center leading-relaxed">
          An admin will verify your delegate or alumni status. You&apos;ll get full access once approved.
        </p>
      </form>
    </AuthShell>
  );
}
