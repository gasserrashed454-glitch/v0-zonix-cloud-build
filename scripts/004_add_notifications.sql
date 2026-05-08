-- Additional tables for notifications
-- Run this script after initial setup

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'upload', 'share', 'ticket', 'system', 'student_verified'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Fix tickets priority column (should be text)
ALTER TABLE public.tickets 
  ALTER COLUMN priority TYPE TEXT USING 
    CASE priority 
      WHEN 1 THEN 'low'
      WHEN 2 THEN 'medium'
      WHEN 3 THEN 'high'
      ELSE 'medium'
    END;

ALTER TABLE public.tickets 
  ALTER COLUMN priority SET DEFAULT 'medium';
