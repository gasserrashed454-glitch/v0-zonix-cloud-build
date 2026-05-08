-- VPS/Container Storage Servers Table
CREATE TABLE IF NOT EXISTS vps_storage_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias TEXT NOT NULL,
  hostname TEXT NOT NULL UNIQUE,
  ip_address INET NOT NULL UNIQUE,
  port INTEGER DEFAULT 22,
  username TEXT NOT NULL,
  password TEXT NOT NULL, -- AES-256 encrypted
  protocol TEXT DEFAULT 'ssh', -- ssh, smb, nfs
  total_storage BIGINT NOT NULL, -- in bytes
  connection_status TEXT DEFAULT 'offline', -- online, offline, error
  last_health_check TIMESTAMP WITH TIME ZONE,
  health_check_interval INTEGER DEFAULT 300, -- 5 minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  
  CONSTRAINT valid_protocol CHECK (protocol IN ('ssh', 'smb', 'nfs')),
  CONSTRAINT valid_status CHECK (connection_status IN ('online', 'offline', 'error')),
  CONSTRAINT valid_port CHECK (port > 0 AND port < 65536),
  CONSTRAINT valid_storage CHECK (total_storage > 0)
);

-- VPS Storage Allocations Table
CREATE TABLE IF NOT EXISTS vps_storage_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vps_server_id UUID NOT NULL REFERENCES vps_storage_servers(id) ON DELETE CASCADE,
  allocation_type TEXT NOT NULL, -- 'fixed' (GB), 'percentage'
  allocation_value INTEGER NOT NULL, -- GB for fixed, 1-100 for percentage
  allocated_to TEXT NOT NULL, -- 'zonix' or enterprise_id
  used_storage BIGINT DEFAULT 0, -- in bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_allocation_type CHECK (allocation_type IN ('fixed', 'percentage')),
  CONSTRAINT valid_allocation_value CHECK (
    (allocation_type = 'fixed' AND allocation_value > 0) OR
    (allocation_type = 'percentage' AND allocation_value > 0 AND allocation_value <= 100)
  )
);

-- VPS Health Check Logs Table
CREATE TABLE IF NOT EXISTS vps_health_check_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vps_server_id UUID NOT NULL REFERENCES vps_storage_servers(id) ON DELETE CASCADE,
  status TEXT NOT NULL, -- success, failure
  available_storage BIGINT, -- in bytes
  latency_ms INTEGER,
  error_message TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_vps_servers_created_by ON vps_storage_servers(created_by);
CREATE INDEX idx_vps_servers_status ON vps_storage_servers(connection_status);
CREATE INDEX idx_vps_allocations_server ON vps_storage_allocations(vps_server_id);
CREATE INDEX idx_vps_allocations_to ON vps_storage_allocations(allocated_to);
CREATE INDEX idx_vps_health_logs_server ON vps_health_check_logs(vps_server_id);
CREATE INDEX idx_vps_health_logs_date ON vps_health_check_logs(checked_at);

-- RLS Policies
ALTER TABLE vps_storage_servers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps_storage_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vps_health_check_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view/manage VPS servers
CREATE POLICY "Admins can manage VPS servers" ON vps_storage_servers
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can view allocations
CREATE POLICY "Admins can manage allocations" ON vps_storage_allocations
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Only admins can view health logs
CREATE POLICY "Admins can view health logs" ON vps_health_check_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
