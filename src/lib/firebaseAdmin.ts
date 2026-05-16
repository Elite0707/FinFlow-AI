import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin SDK for server-side operations (Inngest workers, API routes)
// Requires FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in .env.local
// Get these from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key

function formatPrivateKey(key: string): string {
  // Remove surrounding quotes if present (some .env parsers add them)
  let formatted = key.replace(/^["']|["']$/g, "");
  // Replace literal \n with actual newlines
  formatted = formatted.replace(/\\n/g, "\n");
  return formatted;
}

function getAdminApp(): App {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !rawPrivateKey) {
    const missing = [
      !projectId && "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
      !clientEmail && "FIREBASE_CLIENT_EMAIL",
      !rawPrivateKey && "FIREBASE_PRIVATE_KEY",
    ].filter(Boolean).join(", ");

    throw new Error(
      `Missing Firebase Admin credentials: ${missing}.\n` +
      "Get these from: Firebase Console → Project Settings → Service Accounts → Generate New Private Key"
    );
  }

  const privateKey = formatPrivateKey(rawPrivateKey);

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  });
}

const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminStorage = getStorage(adminApp);
