-- Create storage connections table
CREATE TABLE IF NOT EXISTS storage_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  connection_name TEXT NOT NULL,
  protocol TEXT NOT NULL CHECK (protocol IN ('ssh', 'smb', 'nfs')),
  host TEXT NOT NULL,
  port INTEGER NOT NULL,
  username TEXT NOT NULL,
  encrypted_password TEXT NOT NULL,
  storage_path TEXT,
  export_path TEXT,
  is_active BOOLEAN DEFAULT true,
  last_health_check TIMESTAMP,
  last_error TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create index for user lookups
CREATE INDEX IF NOT EXISTS idx_storage_connections_user_id ON storage_connections(user_id);

-- Enable RLS
ALTER TABLE storage_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own connections
CREATE POLICY "Users can view own storage connections"
  ON storage_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own storage connections"
  ON storage_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own storage connections"
  ON storage_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own storage connections"
  ON storage_connections FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage usage tracking table
CREATE TABLE IF NOT EXISTS storage_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES storage_connections(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_size BIGINT,
  used_size BIGINT,
  available_size BIGINT,
  checked_at TIMESTAMP DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_storage_usage_connection_id ON storage_usage(connection_id);

-- Enable RLS
ALTER TABLE storage_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see usage for their connections
CREATE POLICY "Users can view storage usage"
  ON storage_usage FOR SELECT
  USING (auth.uid() = user_id);
