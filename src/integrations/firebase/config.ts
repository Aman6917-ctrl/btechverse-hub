import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId
);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let warned = false;

function warnMissing(service: string): never {
  if (!warned) {
    warned = true;
    // eslint-disable-next-line no-console
    console.warn(
      `[firebase] Missing VITE_FIREBASE_* env vars — ${service} unavailable. ` +
        "Add them as Build Secrets in Lovable (Workspace Settings → Build Secrets)."
    );
  }
  throw new Error(`Firebase is not configured (missing VITE_FIREBASE_API_KEY). ${service} unavailable.`);
}

function getFirebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) warnMissing("Firebase app");
  if (!app) app = initializeApp(firebaseConfig);
  return app;
}

function getFirebaseAuth(): Auth {
  if (!isFirebaseConfigured) warnMissing("Auth");
  if (!auth) auth = getAuth(getFirebaseApp());
  return auth;
}

function getFirestoreDb(): Firestore {
  if (!isFirebaseConfigured) warnMissing("Firestore");
  if (!db) db = getFirestore(getFirebaseApp());
  return db;
}

function getFirebaseStorage(): FirebaseStorage {
  if (!isFirebaseConfigured) warnMissing("Storage");
  if (!storage) storage = getStorage(getFirebaseApp());
  return storage;
}

export { getFirebaseAuth, getFirestoreDb, getFirebaseStorage };
