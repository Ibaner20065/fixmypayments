// Direct PostgreSQL setup for FixMyPayments Supabase tables
// Run with: node setup-db.mjs

import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db.rdobllmsrbsiooqyvhpt.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'fmp123@vscode',
  ssl: { rejectUnauthorized: false },
});

const SQL = `
-- ═══ 1. PROFILES ═══
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

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

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ═══ 2. TRANSACTIONS ═══
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  raw_text TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  category TEXT NOT NULL,
  merchant TEXT NOT NULL,
  confidence NUMERIC(3, 2) DEFAULT 1.00,
  date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON public.transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own transactions' AND tablename = 'transactions') THEN
    CREATE POLICY "Users can read own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own transactions' AND tablename = 'transactions') THEN
    CREATE POLICY "Users can insert own transactions" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own transactions' AND tablename = 'transactions') THEN
    CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own transactions' AND tablename = 'transactions') THEN
    CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ═══ 3. WALLET CONNECTIONS ═══
CREATE TABLE IF NOT EXISTS public.wallet_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  aml_verified BOOLEAN DEFAULT FALSE,
  aml_rule_id TEXT,
  aml_expiry TIMESTAMPTZ,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, address)
);

CREATE INDEX IF NOT EXISTS idx_wallet_user ON public.wallet_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_address ON public.wallet_connections(address);

ALTER TABLE public.wallet_connections ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own wallets' AND tablename = 'wallet_connections') THEN
    CREATE POLICY "Users can manage own wallets" ON public.wallet_connections FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- ═══ 4. ZAAP BUNDLES ═══
CREATE TABLE IF NOT EXISTS public.zaap_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  wallet_address TEXT NOT NULL,
  bundle_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'executing', 'completed', 'failed')),
  tx_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_zaap_user ON public.zaap_bundles(user_id);
CREATE INDEX IF NOT EXISTS idx_zaap_wallet ON public.zaap_bundles(wallet_address);
CREATE INDEX IF NOT EXISTS idx_zaap_status ON public.zaap_bundles(status);

ALTER TABLE public.zaap_bundles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own bundles' AND tablename = 'zaap_bundles') THEN
    CREATE POLICY "Users can manage own bundles" ON public.zaap_bundles FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
`;

async function main() {
  console.log('🔧 Connecting to Supabase PostgreSQL...');
  
  try {
    await client.connect();
    console.log('✅ Connected!\n');
    
    console.log('📦 Creating tables, indexes, and RLS policies...');
    await client.query(SQL);
    console.log('✅ All schemas created successfully!\n');
    
    // Verify tables exist
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'transactions', 'wallet_connections', 'zaap_bundles')
      ORDER BY table_name;
    `);
    
    console.log('📊 Verified tables:');
    res.rows.forEach(r => console.log(`   ✅ ${r.table_name}`));
    
    // Verify RLS is enabled
    const rlsRes = await client.query(`
      SELECT tablename, rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('profiles', 'transactions', 'wallet_connections', 'zaap_bundles');
    `);
    
    console.log('\n🔒 RLS Status:');
    rlsRes.rows.forEach(r => console.log(`   ${r.rowsecurity ? '🔒' : '⚠️'} ${r.tablename}: ${r.rowsecurity ? 'ENABLED' : 'DISABLED'}`));
    
    console.log('\n🎉 Database setup complete! You can now run: npm run dev');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('IPv6')) {
      console.log('\n💡 Tip: Your network might not support IPv6. Try using the Session Pooler:');
      console.log('   Host: aws-0-ap-south-1.pooler.supabase.com');
    }
  } finally {
    await client.end();
  }
}

main();
