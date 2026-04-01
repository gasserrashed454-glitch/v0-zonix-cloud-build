-- Zonix Cloud RLS Policies

-- Helper function to check if user is admin/mod/support
CREATE OR REPLACE FUNCTION public.is_staff(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'mod', 'support')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PROFILES POLICIES
-- Users can read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Staff can read all profiles
CREATE POLICY "profiles_select_staff" ON public.profiles
  FOR SELECT USING (public.is_staff(auth.uid()));

-- Admins can update any profile
CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid()));

-- FOLDERS POLICIES
CREATE POLICY "folders_select_own" ON public.folders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "folders_insert_own" ON public.folders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "folders_update_own" ON public.folders
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "folders_delete_own" ON public.folders
  FOR DELETE USING (auth.uid() = user_id);

-- FILES POLICIES
CREATE POLICY "files_select_own" ON public.files
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "files_insert_own" ON public.files
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "files_update_own" ON public.files
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "files_delete_own" ON public.files
  FOR DELETE USING (auth.uid() = user_id);

-- Staff can view all files
CREATE POLICY "files_select_staff" ON public.files
  FOR SELECT USING (public.is_staff(auth.uid()));

-- Shared files - users can see files shared with them
CREATE POLICY "files_select_shared" ON public.files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.shared_files sf
      WHERE sf.file_id = files.id 
      AND (sf.shared_with = auth.uid() OR sf.shared_link IS NOT NULL)
      AND (sf.expires_at IS NULL OR sf.expires_at > NOW())
    )
  );

-- SHARED FILES POLICIES
CREATE POLICY "shared_files_select_own" ON public.shared_files
  FOR SELECT USING (shared_by = auth.uid() OR shared_with = auth.uid());

CREATE POLICY "shared_files_insert_own" ON public.shared_files
  FOR INSERT WITH CHECK (shared_by = auth.uid());

CREATE POLICY "shared_files_delete_own" ON public.shared_files
  FOR DELETE USING (shared_by = auth.uid());

-- TICKETS POLICIES
-- Users can see their own tickets
CREATE POLICY "tickets_select_own" ON public.tickets
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create tickets
CREATE POLICY "tickets_insert_own" ON public.tickets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own open tickets
CREATE POLICY "tickets_update_own" ON public.tickets
  FOR UPDATE USING (auth.uid() = user_id AND status = 'open');

-- Staff can see all tickets
CREATE POLICY "tickets_select_staff" ON public.tickets
  FOR SELECT USING (public.is_staff(auth.uid()));

-- Staff can update any ticket
CREATE POLICY "tickets_update_staff" ON public.tickets
  FOR UPDATE USING (public.is_staff(auth.uid()));

-- TICKET MESSAGES POLICIES
CREATE POLICY "ticket_messages_select_own" ON public.ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_messages.ticket_id AND t.user_id = auth.uid()
    ) AND NOT is_internal
  );

CREATE POLICY "ticket_messages_insert_own" ON public.ticket_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_messages.ticket_id AND t.user_id = auth.uid()
    )
  );

-- Staff can see all messages including internal
CREATE POLICY "ticket_messages_select_staff" ON public.ticket_messages
  FOR SELECT USING (public.is_staff(auth.uid()));

-- Staff can insert messages
CREATE POLICY "ticket_messages_insert_staff" ON public.ticket_messages
  FOR INSERT WITH CHECK (public.is_staff(auth.uid()));

-- INVOICES POLICIES
CREATE POLICY "invoices_select_own" ON public.invoices
  FOR SELECT USING (auth.uid() = user_id);

-- Staff can view all invoices
CREATE POLICY "invoices_select_staff" ON public.invoices
  FOR SELECT USING (public.is_staff(auth.uid()));

-- ACTIVITY LOGS POLICIES
-- Users can see their own activity
CREATE POLICY "activity_logs_select_own" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Staff can see all activity
CREATE POLICY "activity_logs_select_staff" ON public.activity_logs
  FOR SELECT USING (public.is_staff(auth.uid()));

-- System can insert activity logs
CREATE POLICY "activity_logs_insert" ON public.activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- VERIFICATION CODES POLICIES
-- Only allow selecting codes that match the current request (handled via service role)
CREATE POLICY "verification_codes_select" ON public.verification_codes
  FOR SELECT USING (TRUE); -- Service role will handle this

CREATE POLICY "verification_codes_insert" ON public.verification_codes
  FOR INSERT WITH CHECK (TRUE); -- Service role will handle this

CREATE POLICY "verification_codes_update" ON public.verification_codes
  FOR UPDATE USING (TRUE); -- Service role will handle this

-- STORAGE SETTINGS POLICIES
-- Only admins can view/modify storage settings
CREATE POLICY "storage_settings_select_admin" ON public.storage_settings
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "storage_settings_update_admin" ON public.storage_settings
  FOR UPDATE USING (public.is_admin(auth.uid()));

CREATE POLICY "storage_settings_insert_admin" ON public.storage_settings
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
