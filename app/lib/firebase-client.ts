/**
 * Firebase Client SDK — browser-side singleton.
 * Used in frontend components for authentication (sign-in / sign-up).
 *
 * ⚠ Fill in the NEXT_PUBLIC_FIREBASE_* env vars in .env.local
 *   with values from Firebase Console → Project Settings → Web app config.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const firebaseApp = app;

let _auth: Auth | null = null;
export const getFirebaseAuth = (): Auth => {
  if (!_auth) {
    _auth = getAuth(app);
  }
  return _auth;
};
