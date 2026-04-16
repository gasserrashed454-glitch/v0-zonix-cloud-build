-- Set gasserrashed454@gmail.com as admin
-- This grants full admin access to the admin panel

UPDATE profiles 
SET role = 'admin'
WHERE email = 'gasserrashed454@gmail.com';

-- Verify the update
SELECT id, email, role, tier FROM profiles WHERE email = 'gasserrashed454@gmail.com';
