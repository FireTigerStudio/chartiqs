-- Chartiqs Supabase Database Schema
-- Safe to re-run (idempotent) - uses DROP IF EXISTS before CREATE

-- 0. Profiles table (ShipFast core table, auto-created on user signup)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  image TEXT,
  customer_id TEXT,  -- Stripe customer ID
  price_id TEXT,     -- Stripe price ID
  has_access BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, image)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 1. AI usage tracking table
CREATE TABLE IF NOT EXISTS ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  question_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 2. Analysis result cache table
CREATE TABLE IF NOT EXISTS analysis_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol TEXT NOT NULL,
  analysis_data JSONB NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cache_symbol ON analysis_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON analysis_cache(expires_at);

-- 3. Disclaimer confirmations table
CREATE TABLE IF NOT EXISTS disclaimer_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  confirmed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE disclaimer_confirmations ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies - ai_usage
DROP POLICY IF EXISTS "Users can view own usage" ON ai_usage;
CREATE POLICY "Users can view own usage" ON ai_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own usage" ON ai_usage;
CREATE POLICY "Users can insert own usage" ON ai_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own usage" ON ai_usage;
CREATE POLICY "Users can update own usage" ON ai_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. RLS policies - analysis_cache (all authenticated users can read, server writes via service_role)
DROP POLICY IF EXISTS "Authenticated users can read cache" ON analysis_cache;
CREATE POLICY "Authenticated users can read cache" ON analysis_cache
  FOR SELECT TO authenticated USING (true);

-- 7. RLS policies - disclaimer_confirmations
DROP POLICY IF EXISTS "Users can view own confirmation" ON disclaimer_confirmations;
CREATE POLICY "Users can view own confirmation" ON disclaimer_confirmations
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own confirmation" ON disclaimer_confirmations;
CREATE POLICY "Users can insert own confirmation" ON disclaimer_confirmations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Cleanup expired cache function (optional, for scheduled jobs)
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM analysis_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
