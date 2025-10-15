-- Add subscription fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'canceled', 'past_due'));

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Create subscriptions table for tracking subscription history
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'canceled', 'past_due', 'trialing')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Create usage tracking table (for limits)
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  updates_count INTEGER DEFAULT 0,
  projects_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_date ON usage_tracking(user_id, date);

-- Enable RLS
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view their own usage"
  ON usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to check if user is Pro
CREATE OR REPLACE FUNCTION is_pro_user(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_uuid
    AND subscription_tier = 'pro'
    AND subscription_status = 'active'
    AND (subscription_end_date IS NULL OR subscription_end_date > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's project count
CREATE OR REPLACE FUNCTION get_user_project_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM projects WHERE user_id = user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get today's update count
CREATE OR REPLACE FUNCTION get_today_update_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM updates
    WHERE user_id = user_uuid
    AND DATE(created_at) = CURRENT_DATE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create project
CREATE OR REPLACE FUNCTION can_create_project(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_pro BOOLEAN;
  project_count INTEGER;
BEGIN
  is_pro := is_pro_user(user_uuid);

  -- Pro users have unlimited projects
  IF is_pro THEN
    RETURN TRUE;
  END IF;

  -- Free users limited to 3 projects
  project_count := get_user_project_count(user_uuid);
  RETURN project_count < 3;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can create update
CREATE OR REPLACE FUNCTION can_create_update(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_pro BOOLEAN;
  today_count INTEGER;
BEGIN
  is_pro := is_pro_user(user_uuid);

  -- Pro users have unlimited updates
  IF is_pro THEN
    RETURN TRUE;
  END IF;

  -- Free users limited to 5 updates per day
  today_count := get_today_update_count(user_uuid);
  RETURN today_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comments for documentation
COMMENT ON COLUMN profiles.subscription_tier IS 'User subscription tier: free or pro';
COMMENT ON COLUMN profiles.subscription_status IS 'Subscription status: active, inactive, canceled, past_due';
COMMENT ON COLUMN profiles.subscription_end_date IS 'When the subscription ends (for canceled subscriptions)';
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for this user';
COMMENT ON COLUMN profiles.stripe_subscription_id IS 'Stripe subscription ID for this user';

COMMENT ON TABLE subscriptions IS 'Subscription history and details';
COMMENT ON TABLE usage_tracking IS 'Daily usage tracking for rate limiting';

COMMENT ON FUNCTION is_pro_user IS 'Check if user has an active Pro subscription';
COMMENT ON FUNCTION can_create_project IS 'Check if user can create a new project (Pro: unlimited, Free: 3 max)';
COMMENT ON FUNCTION can_create_update IS 'Check if user can create a new update (Pro: unlimited, Free: 5/day)';
