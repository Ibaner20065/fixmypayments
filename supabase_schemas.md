# FixMyPayments — Supabase SQL Schemas

> Run these queries in your Supabase project's **SQL Editor** (Dashboard → SQL Editor → New Query).
> Run them **in order** — profiles first, then the rest.

---

## 1. Profiles Table (extends Supabase Auth)

```sql
-- ═══ PROFILES ═══
-- Auto-extends auth.users with display name and avatar

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

## 2. Transactions Table

```sql
-- ═══ TRANSACTIONS ═══
-- Stores AI-classified expense entries per user

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Food', 'Transport', 'Shopping', 'Utilities',
    'Medical', 'Entertainment', 'Health', 'Groceries'
  )),
  merchant TEXT NOT NULL,
  confidence NUMERIC(3, 2) DEFAULT 1.00,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX idx_transactions_category ON public.transactions(category);
CREATE INDEX idx_transactions_user_date ON public.transactions(user_id, date DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON public.transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON public.transactions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON public.transactions FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 3. Wallet Connections Table

```sql
-- ═══ WALLET CONNECTIONS ═══
-- Tracks Web3 wallet links with PureFi AML verification status

CREATE TABLE public.wallet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  aml_verified BOOLEAN DEFAULT FALSE,
  aml_rule_id TEXT,
  aml_expiry TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, address)
);

CREATE INDEX idx_wallet_user ON public.wallet_connections(user_id);
CREATE INDEX idx_wallet_address ON public.wallet_connections(address);

ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own wallets"
  ON public.wallet_connections FOR ALL
  USING (auth.uid() = user_id);
```

---

## 4. ZAAP Bundles Table

```sql
-- ═══ ZAAP BUNDLES ═══
-- DeFi transaction bundle tracking for gasless operations

CREATE TABLE public.zaap_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  bundle_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_zaap_user ON public.zaap_bundles(user_id);
CREATE INDEX idx_zaap_wallet ON public.zaap_bundles(wallet_address);
CREATE INDEX idx_zaap_status ON public.zaap_bundles(status);

ALTER TABLE public.zaap_bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own bundles"
  ON public.zaap_bundles FOR ALL
  USING (auth.uid() = user_id);
```

---

## 5. Useful Queries

### Get spending by category for current user
```sql
SELECT category, SUM(amount) as total, COUNT(*) as count
FROM public.transactions
WHERE user_id = auth.uid()
GROUP BY category
ORDER BY total DESC;
```

### Get monthly spending trend
```sql
SELECT
  DATE_TRUNC('month', date) AS month,
  SUM(amount) AS total,
  COUNT(*) AS transaction_count
FROM public.transactions
WHERE user_id = auth.uid()
GROUP BY month
ORDER BY month DESC
LIMIT 12;
```

### Get wallet with AML status
```sql
SELECT address, aml_verified, aml_expiry,
  CASE WHEN aml_expiry < NOW() THEN 'expired' ELSE 'active' END AS aml_status
FROM public.wallet_connections
WHERE user_id = auth.uid();
```
