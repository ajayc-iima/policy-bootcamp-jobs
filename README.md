# Policy Bootcamp Job Portal — 2026

An exclusive job board for **Policy Bootcamp delegates & alumni**, Rastram School of Public Leadership, Rishihood University. Members post roles, apply within the network, and trust who's on the other side because every account is admin-approved.

> Stack: **Next.js 14 (App Router) · TypeScript · Tailwind · Firebase (Auth + Firestore)** — mobile-first, PWA-ready.

---

## ✨ Features

| Area | What it does |
|------|--------------|
| **Trust gate** | Sign-up → `pending` → admin approves → `active`. Pending/suspended users can't read or post jobs (enforced by Firestore rules). |
| **Dual role** | One person can post today and apply tomorrow — no separate recruiter accounts. |
| **Jobs** | Search, filter by type, rich detail page, sticky mobile CTA. |
| **Post a job** | Title, org, type, mode, location, salary, description, optional external apply link. |
| **Apply** | Cover note + resume link (Drive/Dropbox). Apply-once is structural (doc id = uid). |
| **My Postings** | Close/reopen, delete, view applicants, change applicant status. |
| **My Applications** | Track status (`submitted`/`reviewing`/`accepted`/`rejected`). |
| **Admin** | Approve / suspend / reinstate members; stats dashboard. |
| **Profile** | Edit name, batch, org, bio, contact link. |

---

## 🚀 Setup (15 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Create the Firebase project
1. Go to <https://console.firebase.google.com> → **Add project** (e.g. `policy-bootcamp-jobs`).
2. **Build → Authentication → Get started** → enable **Google**.
3. **Build → Firestore Database → Create database** → start in **production mode**, pick a region.
4. **Project settings (⚙) → General → Your apps → Web (`</>`)** → register an app → copy the config.

### 3. Configure environment
```bash
cp .env.example .env.local
```
Paste the six values from step 4 above into `.env.local`.

### 4. Deploy the security rules
The file `firestore.rules` is the security backbone — deploy it so the trust gate actually works.
```bash
npm install -g firebase-tools
firebase login
firebase init firestore        # choose "Use an existing project", accept the firestore.rules path
firebase deploy --only firestore:rules
```
> Rules can also be pasted directly into **Firestore → Rules** in the console.

### 5. Run locally
```bash
npm run dev
```
Open <http://localhost:3000>.

### 6. First admin bootstrap
The very first account you create is promoted to `active` and `isAdmin: true` automatically. After that, all new signups stay `pending` until an admin approves them.

1. Sign up the first admin account via the app using Google.
2. Refresh the app — you should see the Admin tab immediately.
3. Every later signup will wait in the approval queue.

---

## ☁️ Deploy to the web (Vercel — free tier)

```bash
npm i -g vercel
vercel              # follow prompts; framework auto-detected as Next.js
```
Then in the Vercel dashboard → **Settings → Environment variables**, add the six `NEXT_PUBLIC_FIREBASE_*` values, and **Redeploy**.

---

## 🧱 Architecture

```
src/
├── app/                         # Next.js App Router pages
│   ├── page.tsx                 # Landing (public)
│   ├── login/ signup/           # Auth
│   ├── jobs/                    # List + /jobs/[id] detail + /jobs/[id]/apply
│   ├── post/                    # Post a job
│   ├── postings/                # My postings + /postings/[id]/applicants
│   ├── applications/            # My applications
│   ├── profile/                 # Edit profile
│   └── admin/                   # Member approval
├── components/                  # Navbar, AuthGate, AppShell, JobCard, UI kit
├── lib/
│   ├── firebase.ts              # App/Auth/Firestore singletons
│   ├── auth-context.tsx         # Auth + profile state
│   ├── jobs-api.ts              # All Firestore data access
│   ├── types.ts                 # Domain model
│   ├── utils.ts                 # cn, timeAgo, validators
│   └── firebase-errors.ts       # Friendly error messages
└── firestore.rules              # Security backbone
```

### Data model
- `users/{uid}` — identity + status (`pending|active|suspended`) + `isAdmin`
- `jobs/{jobId}` — the listing, stamped with `postedBy`
- `jobs/{jobId}/applications/{applicantId}` — poster-facing view (id = uid ⇒ apply-once)
- `applications/{appId}` — applicant-facing mirror for "My Applications"

### Why two copies of each application?
The poster needs "all applicants for my job" (query under the job), the applicant needs "all jobs I applied to" (query across jobs). Mirror-on-write avoids expensive cross-collection queries and lets the rules stay tight.

---

## 🔒 Security model (summary)

- **Client** mirrors state for UX (hides buttons, shows pending screen).
- **Firestore rules** are the source of truth. Key invariants they enforce:
  - Sign-up is forced to `status: "pending"`, `isAdmin: false`.
  - Only `active` users read/write jobs.
  - A user can only edit their own profile, and **cannot** change `status`/`isAdmin`.
  - Only the job's poster can read & status-update applications to their job.
  - Apply-once: the application document id equals the applicant's uid, so re-applying overwrites (idempotent).

---

## 🛠️ Troubleshooting

| Symptom | Fix |
|---------|-----|
| "Missing or insufficient permissions" on first sign-up | `firestore.rules` not deployed — run step 4. |
| New users stuck on "Awaiting approval" | That's intended. An admin approves them from the Admin tab (or you bootstrap per step 6). |
| Can't log in after deploy | Add the deploy domain to **Firebase → Authentication → Settings → Authorized domains**. |
| `NEXT_PUBLIC_*` showing undefined | `.env.local` not at project root, or you didn't restart `npm run dev`. |

---

## 📝 Notes for the team

- Resume links are external (Google Drive etc.) — set the file to "anyone with the link" and paste the URL. This keeps storage cost zero and avoids building a file-upload pipeline.
- If you later want email notifications on new applications, add **Firebase Extensions → Trigger Email** or wire a Cloud Function on the `applications` write.
- To make it a true installable PWA, drop icon files into `/public` and fill the `icons` array in `public/manifest.webmanifest`.

---

*Built for Policy Bootcamp 2026 · Rastram School of Public Leadership, Rishihood University.*
