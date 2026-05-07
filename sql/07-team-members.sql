-- Create team_members table for team management
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  allocated_storage BIGINT DEFAULT 100000000, -- 100MB default
  used_storage BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_owner_id, email)
);

-- Add RLS policies
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own team members"
  ON team_members FOR SELECT
  USING (auth.uid() = team_owner_id);

CREATE POLICY "Users can manage their own team members"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = team_owner_id);

CREATE POLICY "Users can update their own team members"
  ON team_members FOR UPDATE
  USING (auth.uid() = team_owner_id)
  WITH CHECK (auth.uid() = team_owner_id);

CREATE POLICY "Users can delete their own team members"
  ON team_members FOR DELETE
  USING (auth.uid() = team_owner_id);

-- Add storage settings columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS malware_scan_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS password_protection_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS storage_password TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_team_members_team_owner ON team_members(team_owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
