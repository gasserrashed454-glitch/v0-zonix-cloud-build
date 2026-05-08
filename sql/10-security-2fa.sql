-- Add 2FA and security fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_fa_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS two_fa_secret TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS backup_codes JSON DEFAULT '[]'::json;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP DEFAULT now();

-- Create password history table
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  changed_at TIMESTAMP DEFAULT now(),
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on password_history
ALTER TABLE password_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own password history
CREATE POLICY "Users can view own password history"
  ON password_history FOR SELECT
  USING (auth.uid() = user_id);

-- Create two_fa_attempts table for audit
CREATE TABLE IF NOT EXISTS two_fa_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  success BOOLEAN DEFAULT false,
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on two_fa_attempts
ALTER TABLE two_fa_attempts ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can see all 2FA attempts
CREATE POLICY "Admins can view all 2FA attempts"
  ON two_fa_attempts FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR auth.uid() = user_id
  );

-- Create security audit log table
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- Enable RLS on security_audit_logs
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own audit logs
CREATE POLICY "Users can view own security audit logs"
  ON security_audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins can see all audit logs
CREATE POLICY "Admins can view all security audit logs"
  ON security_audit_logs FOR SELECT
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );
