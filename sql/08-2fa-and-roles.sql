-- Add 2FA and role configuration to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_fa_enabled boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_fa_secret text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'support', 'moderator'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oauth_provider text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS oauth_id text;

-- Set support email as support account
UPDATE profiles SET role = 'support' WHERE email = 'support@zonix.me';

-- Set main admin
UPDATE profiles SET role = 'admin' WHERE email = 'gasserrashed454@gmail.com';

-- Create two_fa_codes table for 2FA verification
CREATE TABLE IF NOT EXISTS two_fa_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  expires_at timestamp NOT NULL,
  used_at timestamp,
  CONSTRAINT code_not_empty CHECK (char_length(code) > 0)
);

-- Create RLS policies for 2FA codes
ALTER TABLE two_fa_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own 2FA codes"
  ON two_fa_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own 2FA codes"
  ON two_fa_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource text NOT NULL,
  changes jsonb,
  ip_address text,
  created_at timestamp NOT NULL DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'support')
    )
  );

CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
