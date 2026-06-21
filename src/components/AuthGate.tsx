"use client";

/**
 * Client-side access gate.
 *
 * States handled:
 *   1. Auth still resolving      → spinner
 *   2. Not logged in             → redirect to /auth
 *   3. Logged in, no profile doc → redirect to /auth (profile completion)
 *   4. Logged in but pending     → show approval-pending screen
 *   5. Logged in but suspended   → show suspended screen
 *   6. Active                    → render children
 *
 * Firestore rules enforce the same checks; this is purely UX.
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Clock, Logout, Shield } from "@/components/icons";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { fbUser, profile, loading, needsProfile, logOut } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!loading && !fbUser && !redirecting) {
      const id = setTimeout(() => setRedirecting(true), 500);
      return () => clearTimeout(id);
    }
    if (!loading && needsProfile) {
      router.replace("/auth");
    }
  }, [loading, fbUser, needsProfile, redirecting, router]);

  useEffect(() => {
    if (redirecting) router.replace("/auth");
  }, [redirecting, router]);

  if (loading) {
    return <div className="min-h-[60vh] grid place-items-center"><Spinner /></div>;
  }

  if (!fbUser) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-6">
        <div className="text-center animate-fade-in">
          <div className="mx-auto grid place-items-center h-12 w-12 rounded-2xl bg-navy-100 text-navy-500 mb-3">
            <svg className="w-6 h-6 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="4" />
              <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-sm text-navy-500">Signing in...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <div className="min-h-[60vh] grid place-items-center"><Spinner /></div>;
  }

  if (needsProfile) {
    return <div className="min-h-[60vh] grid place-items-center"><Spinner /></div>;
  }

  if (profile.status === "pending") {
    return <PendingScreen onLogout={() => logOut().then(() => router.push("/auth"))} />;
  }

  if (profile.status === "suspended") {
    return <SuspendedScreen onLogout={() => logOut().then(() => router.push("/auth"))} />;
  }

  if (profile.status === "rejected") {
    return <RejectedScreen onLogout={() => logOut().then(() => router.push("/auth"))} />;
  }

  return <>{children}</>;
}

function PendingScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="max-w-sm w-full text-center animate-fade-in">
        <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-amber-100 text-amber-600 mb-4 shadow-elevation-1">
          <Clock width={28} height={28} />
        </div>
        <h1 className="text-xl font-semibold text-navy-900">Awaiting approval</h1>
        <p className="mt-2 text-sm text-navy-500 leading-relaxed">
          Your account is registered. A Policy BootCamp admin will verify your delegate/alumni status and approve you shortly.
          You&apos;ll get access to post and apply for jobs once approved.
        </p>
        <div className="mt-6 rounded-xl bg-navy-50 border border-navy-100 p-4 text-left">
          <p className="text-xs text-navy-500">Urgent? Contact the programme coordinator with your registered email and batch year.</p>
        </div>
        <Button variant="outline" className="mt-6" onClick={onLogout}>
          <Logout width={16} height={16} /> Sign out
        </Button>
      </div>
    </div>
  );
}

function SuspendedScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="max-w-sm w-full text-center animate-fade-in">
        <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-red-100 text-red-600 mb-4 shadow-elevation-1">
          <Shield width={28} height={28} />
        </div>
        <h1 className="text-xl font-semibold text-navy-900">Account suspended</h1>
        <p className="mt-2 text-sm text-navy-500 leading-relaxed">
          Your access has been paused. Please contact the Policy BootCamp admin team to restore it.
        </p>
        <Button variant="outline" className="mt-6" onClick={onLogout}>Sign out</Button>
      </div>
    </div>
  );
}

function RejectedScreen({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-[70vh] grid place-items-center px-6">
      <div className="max-w-sm w-full text-center animate-fade-in">
        <div className="mx-auto grid place-items-center h-16 w-16 rounded-2xl bg-navy-100 text-navy-600 mb-4 shadow-elevation-1">
          <Shield width={28} height={28} />
        </div>
        <h1 className="text-xl font-semibold text-navy-900">Application not approved</h1>
        <p className="mt-2 text-sm text-navy-500 leading-relaxed">
          Your request to join the Policy BootCamp network was not approved at this time. If you believe this is an error, please contact the admin team.
        </p>
        <Button variant="outline" className="mt-6" onClick={onLogout}>Sign out</Button>
      </div>
    </div>
  );
}
