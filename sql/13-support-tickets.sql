-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  category TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON support_tickets(assigned_to);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tickets"
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id OR 
         (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Create ticket messages table
CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);

ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ticket messages"
  ON ticket_messages FOR SELECT
  USING (
    (SELECT user_id FROM support_tickets WHERE id = ticket_id) = auth.uid()
    OR auth.uid() = (SELECT assigned_to FROM support_tickets WHERE id = ticket_id)
  );

CREATE POLICY "Users can add messages to own tickets"
  ON ticket_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create ticket attachments table
CREATE TABLE IF NOT EXISTS ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  blob_pathname TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON ticket_attachments(ticket_id);

ALTER TABLE ticket_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ticket attachments"
  ON ticket_attachments FOR SELECT
  USING (
    (SELECT user_id FROM support_tickets WHERE id = ticket_id) = auth.uid()
    OR auth.uid() = (SELECT assigned_to FROM support_tickets WHERE id = ticket_id)
  );
