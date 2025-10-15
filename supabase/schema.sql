-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase Auth users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  anonymous_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  status TEXT DEFAULT 'active', -- active, paused, completed
  started_at TIMESTAMPTZ DEFAULT NOW(),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updates table (daily/weekly updates)
CREATE TABLE updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  challenges TEXT,
  mood TEXT, -- happy, neutral, tired, frustrated, excited
  time_spent INTEGER, -- minutes
  day_number INTEGER, -- Day 1, Day 2, ...
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  update_id UUID REFERENCES updates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  update_id UUID REFERENCES updates(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(update_id, user_id)
);

-- Subscriptions table (Stripe)
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT DEFAULT 'free', -- free, pro, team
  status TEXT DEFAULT 'active', -- active, canceled, past_due
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Row Level Security (RLS) Policies

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Projects policies
CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Updates policies
CREATE POLICY "Public updates are viewable by everyone"
  ON updates FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own updates"
  ON updates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own updates"
  ON updates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own updates"
  ON updates FOR DELETE
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Likes are viewable by everyone"
  ON likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like"
  ON likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes"
  ON likes FOR DELETE
  USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Functions

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_updates_updated_at BEFORE UPDATE ON updates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_updates_project_id ON updates(project_id);
CREATE INDEX idx_updates_user_id ON updates(user_id);
CREATE INDEX idx_updates_created_at ON updates(created_at DESC);
CREATE INDEX idx_comments_update_id ON comments(update_id);
CREATE INDEX idx_likes_update_id ON likes(update_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
