import db from './db';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { type User, type Session } from './db';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return randomBytes(32).toString('hex');
}

export function createUser(email: string, passwordHash: string, name?: string): User {
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, email, passwordHash, name || null, now, now);

  return {
    id,
    email,
    password_hash: passwordHash,
    name,
    created_at: now,
    updated_at: now,
  };
}

export function getUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function getUserById(id: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function createSession(userId: string, expiresInHours: number = 24): Session {
  const id = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const token = generateToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInHours * 60 * 60 * 1000).toISOString();
  const createdAt = now.toISOString();

  const stmt = db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, userId, token, expiresAt, createdAt);

  return {
    id,
    user_id: userId,
    token,
    expires_at: expiresAt,
    created_at: createdAt,
  };
}

export function getSessionByToken(token: string): Session | undefined {
  const stmt = db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > datetime(\'now\')');
  return stmt.get(token) as Session | undefined;
}

export function deleteSession(token: string): void {
  const stmt = db.prepare('DELETE FROM sessions WHERE token = ?');
  stmt.run(token);
}

export function updateUserWallet(userId: string, walletAddress: string, isPrimary: boolean = false): void {
  const id = `wallet_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // If this is the primary wallet, unset others
  if (isPrimary) {
    const updateStmt = db.prepare('UPDATE user_wallets SET is_primary = 0 WHERE user_id = ?');
    updateStmt.run(userId);
  }

  const stmt = db.prepare(`
    INSERT INTO user_wallets (id, user_id, wallet_address, is_primary, connected_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  stmt.run(id, userId, walletAddress.toLowerCase(), isPrimary ? 1 : 0, new Date().toISOString());
}

export function getUserWallets(userId: string): Array<{ wallet_address: string; is_primary: number }> {
  const stmt = db.prepare(`
    SELECT wallet_address, is_primary FROM user_wallets WHERE user_id = ?
  `);
  return stmt.all(userId) as Array<{ wallet_address: string; is_primary: number }>;
}
