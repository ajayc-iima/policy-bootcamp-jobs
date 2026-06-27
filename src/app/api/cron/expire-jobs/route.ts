import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { initializeApp, getApps, cert } from "firebase-admin/app";

/**
 * Vercel Cron — auto-close expired jobs, daily at 02:00 UTC.
 *
 * ⚠️ This route must live under `src/app/api/` (not root `app/api/`) because the
 * app's source directory is `src/app`. Next.js ignores a root `app/` when
 * `src/app/` exists, so a route placed there would never be registered and the
 * cron would 404 on every invocation.
 *
 * Schedule: vercel.json → { path: "/api/cron/expire-jobs", schedule: "0 2 * * *" }
 * Auth: Bearer token matching CRON_SECRET (set in Vercel env). Only Vercel's
 * cron invoker can call this.
 */
export const dynamic = "force-dynamic";

let db: ReturnType<typeof getFirestore> | null = null;

function getDb() {
  if (db) return db;

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }

  db = getFirestore();
  return db;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const firestore = getDb();
  const now = Timestamp.now();
  const snapshot = await firestore
    .collection("jobs")
    .where("status", "==", "open")
    .where("expiresAt", "<=", now.toMillis())
    .get();

  if (snapshot.empty) return Response.json({ expired: 0 });

  const batch = firestore.batch();
  snapshot.docs.forEach((d) => {
    batch.update(d.ref, { status: "closed", archivedAt: now.toMillis() });
  });
  await batch.commit();

  return Response.json({ expired: snapshot.size });
}
