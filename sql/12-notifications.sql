-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('alert', 'info', 'warning', 'success')),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  read_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enable_email_alerts BOOLEAN DEFAULT true,
  enable_in_app_notifications BOOLEAN DEFAULT true,
  digest_frequency TEXT DEFAULT 'daily' CHECK (digest_frequency IN ('instant', 'daily', 'weekly')),
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);
