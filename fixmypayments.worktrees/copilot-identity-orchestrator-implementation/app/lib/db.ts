import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'transactions.db'));

db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  -- Users table (identity foundation)
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    firebase_uid TEXT UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);

  -- Decentralized Identity (DID) table
  CREATE TABLE IF NOT EXISTS user_dids (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    did TEXT NOT NULL UNIQUE,
    public_key TEXT NOT NULL,
    private_key_encrypted TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_user_dids_user_id ON user_dids(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_dids_did ON user_dids(did);

  -- Verifiable Credentials table
  CREATE TABLE IF NOT EXISTS user_credentials (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    credential_type TEXT NOT NULL,
    issuer_did TEXT NOT NULL,
    issued_at TEXT DEFAULT CURRENT_TIMESTAMP,
    expiry TEXT,
    status TEXT DEFAULT 'active',
    claims_encrypted TEXT NOT NULL,
    proof_signature TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON user_credentials(user_id);
  CREATE INDEX IF NOT EXISTS idx_credentials_type ON user_credentials(credential_type);
  CREATE INDEX IF NOT EXISTS idx_credentials_status ON user_credentials(status);

  -- Credential Revocation Registry
  CREATE TABLE IF NOT EXISTS credential_revocation (
    id TEXT PRIMARY KEY,
    credential_id TEXT NOT NULL UNIQUE,
    revoked_at TEXT DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    FOREIGN KEY (credential_id) REFERENCES user_credentials(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_revocation_credential ON credential_revocation(credential_id);

  -- Risk/Fraud Scores
  CREATE TABLE IF NOT EXISTS fraud_scores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    risk_level TEXT,
    score REAL DEFAULT 0,
    factors TEXT,
    calculated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_fraud_scores_user_id ON fraud_scores(user_id);

  -- Updated Transactions table (now linked to users)
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    raw_text TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    merchant TEXT NOT NULL,
    date TEXT NOT NULL,
    confidence REAL DEFAULT 1.0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
  CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);

  -- Updated Wallet Connections table
  CREATE TABLE IF NOT EXISTS wallet_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    address TEXT UNIQUE NOT NULL,
    connected_at TEXT DEFAULT CURRENT_TIMESTAMP,
    aml_verified INTEGER DEFAULT 0,
    aml_rule_id TEXT,
    aml_expiry TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_wallet_address ON wallet_connections(address);
  CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet_connections(user_id);

  -- Updated ZAAP Bundles table
  CREATE TABLE IF NOT EXISTS zaap_bundles (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    wallet_address TEXT NOT NULL,
    bundle_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_zaap_wallet ON zaap_bundles(wallet_address);
  CREATE INDEX IF NOT EXISTS idx_zaap_status ON zaap_bundles(status);
  CREATE INDEX IF NOT EXISTS idx_zaap_user_id ON zaap_bundles(user_id);
`);

export type User = {
  id: string;
  email: string;
  password_hash: string;
  firebase_uid?: string;
  created_at: string;
  updated_at: string;
};

export type UserDID = {
  id: string;
  user_id: string;
  did: string;
  public_key: string;
  private_key_encrypted: string;
  created_at: string;
};

export type UserCredential = {
  id: string;
  user_id: string;
  credential_type: string;
  issuer_did: string;
  issued_at: string;
  expiry?: string;
  status: 'active' | 'revoked' | 'expired';
  claims_encrypted: string;
  proof_signature: string;
};

export type CredentialRevocation = {
  id: string;
  credential_id: string;
  revoked_at: string;
  reason?: string;
};

export type FraudScore = {
  id: string;
  user_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  factors?: string;
  calculated_at: string;
};

export type Transaction = {
  id: string;
  user_id?: string;
  raw_text: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
  confidence: number;
};

export type WalletConnection = {
  id: string;
  user_id?: string;
  address: string;
  connected_at: string;
  aml_verified: number;
  aml_rule_id?: string;
  aml_expiry?: string;
};

export type ZaapBundle = {
  id: string;
  user_id?: string;
  wallet_address: string;
  bundle_type: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  tx_hash?: string;
  created_at: string;
  completed_at?: string;
};

export default db;

