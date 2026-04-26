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
  CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    raw_text TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    merchant TEXT NOT NULL,
    date TEXT NOT NULL,
    confidence REAL DEFAULT 1.0
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

  CREATE TABLE IF NOT EXISTS wallet_connections (
    id TEXT PRIMARY KEY,
    address TEXT UNIQUE NOT NULL,
    connected_at TEXT DEFAULT CURRENT_TIMESTAMP,
    aml_verified INTEGER DEFAULT 0,
    aml_rule_id TEXT,
    aml_expiry TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_wallet_address ON wallet_connections(address);

  CREATE TABLE IF NOT EXISTS zaap_bundles (
    id TEXT PRIMARY KEY,
    wallet_address TEXT NOT NULL,
    bundle_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    tx_hash TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_zaap_wallet ON zaap_bundles(wallet_address);
  CREATE INDEX IF NOT EXISTS idx_zaap_status ON zaap_bundles(status);
`);

export type Transaction = {
  id: string;
  raw_text: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
  confidence: number;
};

export type WalletConnection = {
  id: string;
  address: string;
  connected_at: string;
  aml_verified: number;
  aml_rule_id?: string;
  aml_expiry?: string;
};

export type ZaapBundle = {
  id: string;
  wallet_address: string;
  bundle_type: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  tx_hash?: string;
  created_at: string;
  completed_at?: string;
};

export default db;

