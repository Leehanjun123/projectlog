-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow')),
  update_id UUID REFERENCES updates(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Anyone authenticated can create notifications
CREATE POLICY "Authenticated users can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Comments
COMMENT ON TABLE notifications IS 'User notifications for likes, comments, and follows';
COMMENT ON COLUMN notifications.user_id IS 'User receiving the notification';
COMMENT ON COLUMN notifications.actor_id IS 'User who triggered the notification';
COMMENT ON COLUMN notifications.type IS 'Type of notification: like, comment, or follow';
COMMENT ON COLUMN notifications.update_id IS 'Related update (for likes and comments)';
COMMENT ON COLUMN notifications.comment_id IS 'Related comment (for comment notifications)';
