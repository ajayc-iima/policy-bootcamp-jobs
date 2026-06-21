"use client";

/**
 * Auth + profile context — Google-only.
 *
 * Lifecycle:
 *   1. User taps "Continue with Google" → signInWithPopup.
 *   2. If a /users/{uid} doc already exists → load it (returning or pending).
 *   3. If no doc yet → the /auth page collects name/batch/org, then calls
 *      completeProfile() which atomically writes the user doc via the
 *      bootstrap transaction (first-ever signup becomes admin+active;
 *      everyone else is `pending`).
 *
 * Status model (the trust spine of this portal):
 *   - "pending"   → registered, awaiting admin approval (cannot read/write jobs)
 *   - "active"    → approved, full access
 *   - "suspended" → blocked
 *
 * Firestore rules enforce the same checks server-side; this context only
 * mirrors them for UX (hiding buttons, routing).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc, getDoc, getDocFromServer, runTransaction, serverTimestamp, Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AppUser } from "@/lib/types";

interface AuthContextValue {
  fbUser: FirebaseUser | null;
  profile: AppUser | null;
  loading: boolean;        // auth resolving
  /** True only when fully approved — the gate for all job actions. */
  isActive: boolean;
  isAdmin: boolean;
  /** True when signed in via Google but not yet a member (no profile doc). */
  needsProfile: boolean;
  /** Kick off Google sign-in. */
  signInWithGoogle: () => Promise<void>;
  /**
   * Write the new member's profile. Runs the bootstrap transaction: the first
   * member becomes admin+active automatically; everyone else lands in `pending`.
   */
  completeProfile: (info: ProfileInfo) => Promise<void>;
  logOut: () => Promise<void>;
  /** Re-fetch profile after admin updates it (e.g. status change). */
  refreshProfile: () => Promise<void>;
}

export interface ProfileInfo {
  displayName: string;
  batch: string;
  organisation: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Auth timeout ──────────────────────────────────────────────────────
  // Firebase Auth may take time to restore the session on page load (reads
  // IndexedDB). If onAuthStateChanged hasn't fired within 5s we force
  // loading to false so the user sees meaningful UI instead of a stuck spinner.
  useEffect(() => {
    const id = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(id);
  }, []);

  const loadProfile = useCallback(async (uid: string): Promise<AppUser | null> => {
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
    } as AppUser;
  }, []);

  const loadProfileFresh = useCallback(async (uid: string): Promise<AppUser | null> => {
    const snap = await getDocFromServer(doc(db, "users", uid));
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
    } as AppUser;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!fbUser) return;
    // Read from the server (not cache) so admin-driven status changes — e.g.
    // being approved/suspended — are reflected immediately after save.
    const p = await loadProfileFresh(fbUser.uid);
    setProfile(p);
  }, [fbUser, loadProfileFresh]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        setFbUser(user);
        if (user) {
          const p = await loadProfile(user.uid);
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [loadProfile]);

  const signInWithGoogle = useCallback(async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    await signInWithPopup(auth, provider);
    // onAuthStateChanged picks up the new user and loads (or finds no) profile.
  }, []);

  /**
   * Bootstrap transaction, used for every new signup.
   *   - If no bootstrap marker exists yet → this is the first signup, so it
   *     becomes admin + active (the project owner sets up the first account).
   *   - Otherwise → status "pending", awaiting approval.
   *
   * Security note: there is NO client-side admin-by-email shortcut. The old
   * one was a privilege-escalation backdoor — the Firestore rules now allow an
   * `active+isAdmin:true` user doc ONLY on the first signup, and this is the
   * only code path that can write one. Everything else is forced to pending.
   * Re-runnable: if the bootstrap admin is ever deleted (config/bootstrap too),
   * the next signup takes over — useful during development cleanup.
   */
  const completeProfile = useCallback(async (info: ProfileInfo) => {
    if (!fbUser) throw new Error("Not signed in.");
    const userRef = doc(db, "users", fbUser.uid);
    const bootstrapRef = doc(db, "config", "bootstrap");

    const profileData = {
      uid: fbUser.uid,
      email: fbUser.email ?? "",
      displayName: info.displayName,
      batch: info.batch,
      organisation: info.organisation,
      bio: "",
      contactLink: "",
    };

    await runTransaction(db, async (tx) => {
      const bootstrapSnap = await tx.get(bootstrapRef);
      const needsBootstrap = !bootstrapSnap.exists();

      if (needsBootstrap) {
        tx.set(bootstrapRef, { adminUid: fbUser.uid, initializedAt: serverTimestamp() });
        tx.set(userRef, { ...profileData, status: "active", isAdmin: true, createdAt: serverTimestamp() });
      } else {
        tx.set(userRef, { ...profileData, status: "pending", isAdmin: false, createdAt: serverTimestamp() });
      }
    });

    const p = await loadProfileFresh(fbUser.uid);
    setProfile(p);
  }, [fbUser, loadProfile]);

  const logOut = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
    setFbUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    fbUser,
    profile,
    loading,
    isActive: profile?.status === "active",
    isAdmin: !!profile?.isAdmin,
    needsProfile: !!fbUser && !profile,
    signInWithGoogle,
    completeProfile,
    logOut,
    refreshProfile,
  }), [fbUser, profile, loading, signInWithGoogle, completeProfile, logOut, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
