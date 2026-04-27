import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Use in-memory database for Vercel (serverless doesn't support SQLite persistence)
const isVercel = process.env.VERCEL === '1';
const db = new Database(isVercel ? ':memory:' : path.join(dataDir, 'transactions.db'));

db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

  CREATE TABLE IF NOT EXISTS user_wallets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    wallet_address TEXT UNIQUE NOT NULL,
    is_primary INTEGER DEFAULT 0,
    connected_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_user_wallets_user_id ON user_wallets(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_wallets_address ON user_wallets(wallet_address);

  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    raw_text TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    merchant TEXT NOT NULL,
    date TEXT NOT NULL,
    confidence REAL DEFAULT 1.0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

  CREATE TABLE IF NOT EXISTS wallet_connections (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    address TEXT NOT NULL,
    connected_at TEXT DEFAULT CURRENT_TIMESTAMP,
    aml_verified INTEGER DEFAULT 0,
    aml_rule_id TEXT,
    aml_expiry TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, address)
  );

  CREATE INDEX IF NOT EXISTS idx_wallet_user_id ON wallet_connections(user_id);
  CREATE INDEX IF NOT EXISTS idx_wallet_address ON wallet_connections(address);

  CREATE TABLE IF NOT EXISTS zaap_bundles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    bundle_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_zaap_user_id ON zaap_bundles(user_id);
  CREATE INDEX IF NOT EXISTS idx_zaap_wallet ON zaap_bundles(wallet_address);
  CREATE INDEX IF NOT EXISTS idx_zaap_status ON zaap_bundles(status);

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
`);

export type Transaction = {
  id: string;
  user_id: string;
  raw_text: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
  confidence: number;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  password_hash: string;
  name?: string;
  created_at: string;
  updated_at: string;
};

export type UserWallet = {
  id: string;
  user_id: string;
  wallet_address: string;
  is_primary: number;
  connected_at: string;
};

export type WalletConnection = {
  id: string;
  user_id: string;
  address: string;
  connected_at: string;
  aml_verified: number;
  aml_rule_id?: string;
  aml_expiry?: string;
};

export type ZaapBundle = {
  id: string;
  user_id: string;
  wallet_address: string;
  bundle_type: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  tx_hash?: string;
  created_at: string;
  completed_at?: string;
};

export type Session = {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
};

export default db;

