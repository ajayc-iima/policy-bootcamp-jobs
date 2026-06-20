/** Map opaque Firebase errors to friendly, mobile-friendly messages. */
export function firebaseError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  const rawMessage = (err as { message?: string })?.message ?? "";
  const map: Record<string, string> = {
    "auth/invalid-email": "That email address looks invalid.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with these credentials.",
    "auth/operation-not-allowed": "Google sign-in isn't enabled for this project yet. Ask the admin to enable it in the Firebase Console.",
    "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
    "auth/network-request-failed": "Network issue. Check your connection and retry.",
    "auth/internal-error": "Google sign-in failed. Check that the Google provider is enabled in Firebase Console and this domain is authorised.",
    "auth/popup-blocked": "Pop-up was blocked. Allow pop-ups for this site and try again.",
    "auth/popup-closed-by-user": "Sign-in cancelled.",
    "auth/cancelled-popup-request": "Sign-in cancelled.",
    "auth/configuration-not-found": "Firebase Auth is not enabled for this project. In Firebase Console, enable Authentication and the Google provider, then reload the app.",
    "permission-denied": "You don't have access to do this yet. Your account may still be pending approval.",
    "unavailable": "Service is temporarily unavailable. Please retry.",
  };
  return (map[code] ?? rawMessage) || "Something went wrong. Please try again.";
}
