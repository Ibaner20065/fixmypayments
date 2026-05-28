import * as admin from 'firebase-admin';
import { env } from './env';

const privateKey = env.FIREBASE_PRIVATE_KEY
  ? env.FIREBASE_PRIVATE_KEY.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n')
  : undefined;

if (!admin.apps.length) {
  if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && privateKey) {
    let finalKey = privateKey;
    if (!finalKey.includes('-----BEGIN PRIVATE KEY-----')) {
      finalKey = `-----BEGIN PRIVATE KEY-----\n${finalKey}\n-----END PRIVATE KEY-----`;
    }

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: finalKey,
      }),
    });
  } else {
    console.warn('⚠ Firebase Admin not initialized — missing credentials');
  }
}

export const adminAuth = admin.apps.length ? admin.auth() : null;

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
