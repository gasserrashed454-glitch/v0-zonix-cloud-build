-- Create storage_connections table
CREATE TABLE IF NOT EXISTS storage_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('vps', 'nas', 'dedicated')),
  hostname text NOT NULL,
  port integer NOT NULL DEFAULT 22,
  username text NOT NULL,
  password text NOT NULL, -- Encrypted
  protocol text NOT NULL CHECK (protocol IN ('ssh', 'smb', 'nfs')),
  status text NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'error')),
  last_tested_at timestamp,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);

-- Create RLS policies
ALTER TABLE storage_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON storage_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON storage_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON storage_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON storage_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create file_shares table for tracking shared files
CREATE TABLE IF NOT EXISTS file_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id uuid NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  shared_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email text,
  permission text NOT NULL DEFAULT 'view' CHECK (permission IN ('view', 'edit', 'download')),
  created_at timestamp NOT NULL DEFAULT now(),
  expires_at timestamp,
  CONSTRAINT must_have_recipient CHECK (
    (shared_with_user_id IS NOT NULL) OR (shared_with_email IS NOT NULL)
  )
);

ALTER TABLE file_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view shares of their files"
  ON file_shares FOR SELECT
  USING (
    auth.uid() = shared_by_user_id OR
    auth.uid() = shared_with_user_id
  );

CREATE POLICY "Users can create shares of their files"
  ON file_shares FOR INSERT
  WITH CHECK (auth.uid() = shared_by_user_id);

CREATE POLICY "Users can delete shares of their files"
  ON file_shares FOR DELETE
  USING (auth.uid() = shared_by_user_id);

-- Create support_tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'resolved', 'closed')),
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now(),
  resolved_at timestamp
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Support can view all tickets"
  ON support_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'support')
    )
  );

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);
