import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

// `getAuth` validates the API key eagerly, which would crash the whole app
// on load if NEXT_PUBLIC_FIREBASE_* env vars aren't set yet. Only touch the
// Firebase SDK when a config is actually present; callers check `auth`.
export const auth: Auth | null = isFirebaseConfigured
  ? getAuth(getApps().length ? getApp() : initializeApp(firebaseConfig))
  : null;

export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super("Firebase no está configurado todavía. Revisa las variables NEXT_PUBLIC_FIREBASE_* en .env.local.");
    this.name = "FirebaseNotConfiguredError";
  }
}
