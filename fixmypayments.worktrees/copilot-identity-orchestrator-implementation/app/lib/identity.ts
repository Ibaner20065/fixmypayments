import db from './db';
import crypto from 'crypto';

// Generate a W3C DID in did:key format
// did:key:z6Mk[base58-encoded-public-key]
export function generateDID(): { did: string; publicKey: string; privateKeyEncrypted: string } {
  // Generate RSA key pair (2048-bit, widely supported)
  const keyPair = crypto.generateKeyPairSync('rsa' as any, {
    modulusLength: 2048,
    publicKeyEncoding: { format: 'spki' } as any,
    privateKeyEncoding: { format: 'pkcs8' } as any,
  } as any);

  const publicKey = keyPair.publicKey as any;
  const privateKey = keyPair.privateKey as any;

  // Convert public key to hex for storage
  const publicKeyHex = publicKey instanceof Buffer ? publicKey.toString('hex') : String(publicKey);
  const publicKeyBase58 = base58Encode(crypto.createHash('sha256').update(publicKeyHex).digest());

  // DID format: did:key:z6Mk[base58-public-key]
  const did = `did:key:z6Mk${publicKeyBase58}`;

  // Encrypt private key (AES-256-GCM)
  const encryptionKeyInput = process.env.DID_ENCRYPTION_KEY || 'default-key-change-in-production';
  const encryptionKey = crypto.scryptSync(encryptionKeyInput, 'salt-value', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
  
  const privateKeyBuffer = privateKey instanceof Buffer ? privateKey : Buffer.from(String(privateKey));
  let encrypted = cipher.update(privateKeyBuffer);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  const encryptedPrivateKey = Buffer.concat([iv, authTag, encrypted]).toString('hex');

  return {
    did,
    publicKey: publicKeyHex,
    privateKeyEncrypted: encryptedPrivateKey,
  };
}

// Create DID for a user (called on signup)
export function createUserDID(userId: string): { did: string } | null {
  try {
    // Check if user already has a DID
    const existing = db.prepare('SELECT did FROM user_dids WHERE user_id = ?').get(userId);
    if (existing) {
      return { did: (existing as any).did };
    }

    const { did, publicKey, privateKeyEncrypted } = generateDID();
    const didId = crypto.randomUUID();

    db.prepare(`
      INSERT INTO user_dids (id, user_id, did, public_key, private_key_encrypted, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(didId, userId, did, publicKey, privateKeyEncrypted, new Date().toISOString());

    return { did };
  } catch (error) {
    console.error('Error creating DID:', error);
    return null;
  }
}

// Get DID for a user
export function getUserDID(userId: string): { did: string; publicKey: string } | null {
  try {
    const result = db.prepare('SELECT did, public_key FROM user_dids WHERE user_id = ?').get(userId) as any;
    return result ? { did: result.did, publicKey: result.public_key } : null;
  } catch (error) {
    console.error('Error getting DID:', error);
    return null;
  }
}

// Resolve DID (lookup public key)
export function resolveDID(did: string): { publicKey: string; userId: string } | null {
  try {
    const result = db.prepare('SELECT public_key, user_id FROM user_dids WHERE did = ?').get(did) as any;
    return result ? { publicKey: result.public_key, userId: result.user_id } : null;
  } catch (error) {
    console.error('Error resolving DID:', error);
    return null;
  }
}

// Simple base58 encoding (production: use bs58 library)
function base58Encode(buffer: Buffer): string {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  const base = BigInt(alphabet.length);

  if (buffer.length === 0) return '';

  let num = 0n;
  for (const byte of buffer) {
    num = num * 256n + BigInt(byte);
  }

  let encoded = '';
  while (num > 0n) {
    encoded = alphabet[Number(num % base)] + encoded;
    num = num / base;
  }

  // Add leading zeros
  for (const byte of buffer) {
    if (byte === 0) encoded = alphabet[0] + encoded;
    else break;
  }

  return encoded;
}
