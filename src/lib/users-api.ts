"use client";

import {
  collection, query, where, orderBy, getDocs, getCountFromServer, doc, getDoc, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppUser, UserStatus } from "@/lib/types";

function parseUser(id: string, data: Record<string, unknown>): AppUser {
  return {
    ...data, uid: id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : data.createdAt,
  } as AppUser;
}

export async function fetchActiveUsers(): Promise<AppUser[]> {
  const q = query(
    collection(db, "users"),
    where("status", "==", "active"),
    orderBy("displayName", "asc"),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => parseUser(d.id, d.data() as Record<string, unknown>));
}

export async function fetchUser(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return parseUser(snap.id, snap.data() as Record<string, unknown>);
}

/**
 * Accurate per-status member counts via Firestore aggregate queries.
 * Used by the Admin dashboard so the stat tiles are correct regardless of
 * pagination (the member list itself is capped at PAGE_SIZE).
 */
export async function fetchUserCountByStatus(status: UserStatus): Promise<number> {
  const q = query(collection(db, "users"), where("status", "==", status));
  const snap = await getCountFromServer(q);
  return snap.data().count;
}

export async function fetchStatusCounts(): Promise<Record<UserStatus, number>> {
  const [pending, active, suspended, rejected] = await Promise.all([
    fetchUserCountByStatus("pending"),
    fetchUserCountByStatus("active"),
    fetchUserCountByStatus("suspended"),
    fetchUserCountByStatus("rejected"),
  ]);
  return { pending, active, suspended, rejected };
}
