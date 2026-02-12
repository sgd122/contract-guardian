-- gen_random_uuid() is built-in since PostgreSQL 13, no extension needed

-- Enums
CREATE TYPE analysis_status AS ENUM (
  'pending_payment', 'paid', 'processing', 'completed', 'failed'
);

CREATE TYPE risk_level AS ENUM ('high', 'medium', 'low');

CREATE TYPE payment_status AS ENUM (
  'ready', 'in_progress', 'done', 'canceled', 'failed', 'refunded'
);

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  provider TEXT,                          -- 'kakao' | 'google'
  free_analyses_remaining INT DEFAULT 1,  -- First analysis is free
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analyses table (stores contract analysis results)
CREATE TABLE public.analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  original_filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,                -- 'pdf' | 'image'
  file_size_bytes INT NOT NULL,
  extracted_text TEXT,
  page_count INT,
  status analysis_status DEFAULT 'pending_payment',
  overall_risk_level risk_level,
  overall_risk_score INT CHECK (overall_risk_score >= 0 AND overall_risk_score <= 100),
  summary TEXT,
  clauses JSONB DEFAULT '[]'::jsonb,      -- Array of clause analysis results
  improvements JSONB DEFAULT '[]'::jsonb, -- Array of improvement suggestions
  contract_type TEXT,                     -- 'freelance' | 'service' | 'nda' | 'lease' | 'employment' | 'other'
  contract_parties JSONB,                 -- { party_a: string, party_b: string }
  missing_clauses JSONB DEFAULT '[]'::jsonb,
  input_tokens INT,
  output_tokens INT,
  api_cost_usd DECIMAL(10,6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table (Toss Payments records)
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  analysis_id UUID REFERENCES public.analyses(id) NOT NULL,
  order_id TEXT UNIQUE NOT NULL,
  payment_key TEXT UNIQUE,
  amount INT NOT NULL,
  status payment_status DEFAULT 'ready',
  method TEXT,                            -- 'card' | 'kakaopay' | 'tosspay' etc.
  toss_response JSONB,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Consent logs table (legal compliance - explicit user consent tracking)
CREATE TABLE public.consent_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  analysis_id UUID REFERENCES public.analyses(id),
  consent_type TEXT NOT NULL,             -- 'ai_disclaimer' | 'privacy_policy'
  consent_version TEXT NOT NULL,          -- 'v1.0' (for tracking policy changes)
  consented_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

-- Indexes
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
CREATE INDEX idx_analyses_status ON public.analyses(status);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at DESC);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_analysis_id ON public.payments(analysis_id);
CREATE INDEX idx_payments_order_id ON public.payments(order_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_consent_logs_user_id ON public.consent_logs(user_id);
CREATE INDEX idx_consent_logs_analysis_id ON public.consent_logs(analysis_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, provider)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_user_meta_data->>'provider', '')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
