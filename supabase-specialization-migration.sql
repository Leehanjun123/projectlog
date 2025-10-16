-- ========================================
-- SPECIALIZATION MIGRATION FOR INDIE HACKERS
-- ========================================

-- 1. Add category and stage to projects table
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'other',
  ADD COLUMN IF NOT EXISTS stage TEXT DEFAULT 'idea',
  ADD COLUMN IF NOT EXISTS tech_stack TEXT[], -- Array of technologies
  ADD COLUMN IF NOT EXISTS website_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS launch_date TIMESTAMPTZ;

-- 2. Add update type to updates table
ALTER TABLE updates
  ADD COLUMN IF NOT EXISTS update_type TEXT DEFAULT 'log',
  ADD COLUMN IF NOT EXISTS tags TEXT[]; -- Array of tags

-- 3. Create project_metrics table for tracking MRR, users, etc.
CREATE TABLE IF NOT EXISTS project_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  -- Financial metrics
  mrr INTEGER DEFAULT 0, -- Monthly Recurring Revenue in cents
  revenue INTEGER DEFAULT 0, -- Total revenue in cents

  -- User metrics
  total_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  paying_users INTEGER DEFAULT 0,

  -- Growth metrics
  user_growth_rate DECIMAL(5,2), -- Percentage
  revenue_growth_rate DECIMAL(5,2), -- Percentage

  -- Other metrics
  custom_metrics JSONB DEFAULT '{}', -- For flexible custom metrics

  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create tags table for auto-complete and trending tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create project_tags junction table
CREATE TABLE IF NOT EXISTS project_tags (
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, tag_id)
);

-- 6. Create milestones table
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  milestone_type TEXT DEFAULT 'custom', -- first_user, first_dollar, launch, etc.
  achieved_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_projects_category ON projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON projects(stage);
CREATE INDEX IF NOT EXISTS idx_projects_launch_date ON projects(launch_date DESC);
CREATE INDEX IF NOT EXISTS idx_updates_type ON updates(update_type);
CREATE INDEX IF NOT EXISTS idx_project_metrics_project_id ON project_metrics(project_id);
CREATE INDEX IF NOT EXISTS idx_project_metrics_recorded_at ON project_metrics(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_achieved_at ON milestones(achieved_at DESC);

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================

ALTER TABLE project_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

-- Project metrics policies
CREATE POLICY "Public project metrics are viewable by everyone"
  ON project_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_metrics.project_id
      AND projects.is_public = true
    ) OR auth.uid() = user_id
  );

CREATE POLICY "Users can create own project metrics"
  ON project_metrics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project metrics"
  ON project_metrics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project metrics"
  ON project_metrics FOR DELETE
  USING (auth.uid() = user_id);

-- Tags policies
CREATE POLICY "Tags are viewable by everyone"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Project tags policies
CREATE POLICY "Project tags are viewable by everyone"
  ON project_tags FOR SELECT
  USING (true);

CREATE POLICY "Users can create tags for own projects"
  ON project_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tags from own projects"
  ON project_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tags.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Milestones policies
CREATE POLICY "Public milestones are viewable by everyone"
  ON milestones FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = milestones.project_id
      AND projects.is_public = true
    ) OR auth.uid() = user_id
  );

CREATE POLICY "Users can create own milestones"
  ON milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON milestones FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones"
  ON milestones FOR DELETE
  USING (auth.uid() = user_id);

-- ========================================
-- FUNCTIONS & TRIGGERS
-- ========================================

-- Function to update tag usage count
CREATE OR REPLACE FUNCTION increment_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tags
  SET usage_count = usage_count + 1
  WHERE id = NEW.tag_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_project_tag_created
  AFTER INSERT ON project_tags
  FOR EACH ROW EXECUTE FUNCTION increment_tag_usage();

-- Function to decrement tag usage count
CREATE OR REPLACE FUNCTION decrement_tag_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE tags
  SET usage_count = usage_count - 1
  WHERE id = OLD.tag_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_project_tag_deleted
  AFTER DELETE ON project_tags
  FOR EACH ROW EXECUTE FUNCTION decrement_tag_usage();

-- ========================================
-- ENUM VALUES DOCUMENTATION
-- ========================================

-- Project Categories:
-- 'saas' - Software as a Service
-- 'mobile_app' - Mobile Application
-- 'web_app' - Web Application
-- 'api' - API/Backend Service
-- 'tool' - Developer Tool
-- 'content' - Content/Media
-- 'ecommerce' - E-commerce
-- 'marketplace' - Marketplace
-- 'chrome_extension' - Browser Extension
-- 'other' - Other

-- Project Stages:
-- 'idea' - Just an idea
-- 'planning' - Planning phase
-- 'building' - Actively building
-- 'beta' - Beta testing
-- 'launched' - Publicly launched
-- 'growing' - Post-launch growth
-- 'profitable' - Making profit
-- 'acquired' - Acquired/Sold
-- 'shutdown' - Shut down

-- Update Types:
-- 'log' - Daily/Weekly log
-- 'milestone' - Achievement milestone
-- 'launch' - Product launch
-- 'feature' - New feature
-- 'challenge' - Challenge/Problem
-- 'learning' - Learning/Insight
-- 'metrics' - Metrics update
-- 'announcement' - General announcement

-- Milestone Types:
-- 'first_user' - First user signup
-- 'first_paying_user' - First paying customer
-- 'first_dollar' - First dollar earned
-- 'first_hundred' - First $100 MRR
-- 'first_thousand' - First $1000 MRR
-- 'launch' - Product launch
-- 'custom' - Custom milestone
