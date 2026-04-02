-- Set gasserrashed454@gmail.com as admin
-- Run this script to promote the user to admin role

UPDATE profiles 
SET role = 'admin'
WHERE email = 'gasserrashed454@gmail.com';

-- Verify the update
SELECT id, email, role, tier FROM profiles WHERE email = 'gasserrashed454@gmail.com';
