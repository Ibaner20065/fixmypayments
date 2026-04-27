/**
 * Firebase Admin SDK — server-side singleton.
 * Used in all Next.js API routes to:
 *   - Verify Firebase ID tokens
 *   - Read/write Firestore data
 *   - Create/manage users
 */
import * as admin from 'firebase-admin';

// Parse the private key (env stores \n as literal backslash-n)
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
  : undefined;

if (!admin.apps.length) {
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    console.warn(
      '⚠ Firebase Admin credentials missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local'
    );
  } else {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      console.log('✅ Firebase Admin initialized successfully');
    } catch (error) {
      console.error('❌ Firebase Admin init failed:', error);
    }
  }
}

import { getFirestore } from 'firebase-admin/firestore';

export const adminAuth = admin.apps.length ? admin.auth() : null;
export const db = admin.apps.length ? getFirestore() : null;

/** Verify a Firebase ID token from a Bearer header. Returns uid or null. */
export async function verifyToken(authHeader: string | null): Promise<string | null> {
  if (!adminAuth) return null;
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length).trim();
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

/** Default budget limits (₹ per month). Applied when a user has no Firestore budget doc. */
export const DEFAULT_BUDGETS: Record<string, number> = {
  total: 40000,
  Food: 5000,
  Transport: 3000,
  Shopping: 8000,
  Utilities: 4000,
  Medical: 5000,
  Entertainment: 3000,
  Health: 3000,
  Groceries: 6000,
};

/** Fetch user budget from Firestore, falling back to defaults. */
export async function getUserBudgets(uid: string): Promise<Record<string, number>> {
  if (!db) return DEFAULT_BUDGETS;
  const snap = await db.collection('users').doc(uid).get();
  const data = snap.data();
  if (!data?.budget) return DEFAULT_BUDGETS;
  return { ...DEFAULT_BUDGETS, ...data.budget };
}
