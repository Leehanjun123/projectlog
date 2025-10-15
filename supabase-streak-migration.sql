-- Add streak tracking columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_update_date DATE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_update_date ON profiles(last_update_date);

-- Comment the columns
COMMENT ON COLUMN profiles.current_streak IS 'Current consecutive days of updates';
COMMENT ON COLUMN profiles.longest_streak IS 'Longest streak ever achieved';
COMMENT ON COLUMN profiles.last_update_date IS 'Date of last update post';
