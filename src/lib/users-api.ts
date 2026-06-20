"use client";

import {
  collection, query, where, orderBy, getDocs, doc, getDoc, Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AppUser } from "@/lib/types";

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
