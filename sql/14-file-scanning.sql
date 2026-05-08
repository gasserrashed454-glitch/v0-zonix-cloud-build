-- Create file scans table
CREATE TABLE IF NOT EXISTS file_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_status TEXT NOT NULL DEFAULT 'pending' CHECK (scan_status IN ('pending', 'scanning', 'clean', 'infected', 'quarantined')),
  threat_detected BOOLEAN DEFAULT false,
  threat_name TEXT,
  threat_description TEXT,
  scanned_at TIMESTAMP,
  scan_engine TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_file_scans_file_id ON file_scans(file_id);
CREATE INDEX IF NOT EXISTS idx_file_scans_user_id ON file_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_file_scans_status ON file_scans(scan_status);

ALTER TABLE file_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view scans of their files"
  ON file_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all scans"
  ON file_scans FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create quarantine table
CREATE TABLE IF NOT EXISTS quarantined_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scan_id UUID NOT NULL REFERENCES file_scans(id) ON DELETE CASCADE,
  quarantine_reason TEXT NOT NULL,
  threat_name TEXT,
  is_released BOOLEAN DEFAULT false,
  released_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quarantined_files_file_id ON quarantined_files(file_id);
CREATE INDEX IF NOT EXISTS idx_quarantined_files_user_id ON quarantined_files(user_id);

ALTER TABLE quarantined_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their quarantined files"
  ON quarantined_files FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all quarantined files"
  ON quarantined_files FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create scan history/logs table
CREATE TABLE IF NOT EXISTS scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  scan_type TEXT NOT NULL CHECK (scan_type IN ('on_upload', 'manual', 'scheduled', 'quarantine_check')),
  result TEXT NOT NULL CHECK (result IN ('clean', 'infected', 'suspicious', 'error')),
  details JSONB,
  executed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scan_logs_file_id ON scan_logs(file_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_created_at ON scan_logs(created_at DESC);

ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view scan logs"
  ON scan_logs FOR SELECT
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
