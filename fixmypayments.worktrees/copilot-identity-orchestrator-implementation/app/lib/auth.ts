import db from './db';
import crypto from 'crypto';

// Hash password using PBKDF2 (built-in, no external dependencies)
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, passwordSalt, 100000, 64, 'sha256').toString('hex');
  return { hash: `${passwordSalt}:${hash}`, salt: passwordSalt };
}

// Verify password against hash
export function verifyPassword(password: string, passwordHash: string): boolean {
  try {
    const [salt, hash] = passwordHash.split(':');
    const { hash: computedHash } = hashPassword(password, salt);
    const [_, providedHash] = computedHash.split(':');
    return providedHash === hash;
  } catch {
    return false;
  }
}

// Create new user
export function createUser(email: string, password: string): { id: string; email: string } | null {
  try {
    // Check if user exists
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      throw new Error('User already exists');
    }

    const userId = crypto.randomUUID();
    const { hash: passwordHash } = hashPassword(password);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, email, passwordHash, now, now);

    return { id: userId, email };
  } catch (error) {
    console.error('Error creating user:', error);
    return null;
  }
}

// Authenticate user (login)
export function authenticateUser(email: string, password: string): { id: string; email: string } | null {
  try {
    const user = db.prepare('SELECT id, email, password_hash FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return null;
    }

    if (!verifyPassword(password, user.password_hash)) {
      return null;
    }

    return { id: user.id, email: user.email };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return null;
  }
}

// Get user by ID
export function getUserById(userId: string): { id: string; email: string } | null {
  try {
    const user = db.prepare('SELECT id, email FROM users WHERE id = ?').get(userId) as any;
    return user || null;
  } catch (error) {
    console.error('Error getting user:', error);
    return null;
  }
}

// Get user by email
export function getUserByEmail(email: string): { id: string; email: string } | null {
  try {
    const user = db.prepare('SELECT id, email FROM users WHERE email = ?').get(email) as any;
    return user || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
}

// Generate JWT-like token (simple implementation)
// In production, use a proper JWT library
export function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
    })
  ).toString('base64url');

  const secret = process.env.JWT_SECRET || 'development-secret-change-in-production';
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64url');

  return `${header}.${payload}.${signature}`;
}

// Verify JWT token
export function verifyToken(token: string): { userId: string } | null {
  try {
    const secret = process.env.JWT_SECRET || 'development-secret-change-in-production';
    const [header, payload, signature] = token.split('.');

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${header}.${payload}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode and verify expiry
    const decodedPayload = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }

    return { userId: decodedPayload.sub };
  } catch (error) {
    console.error('Error verifying token:', error);
    return null;
  }
}

// Extract user ID from Authorization header
export function extractUserFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  return decoded?.userId || null;
}
