-- Admin Seeding Script for Little Logbook
-- Run this AFTER running the main schema and AFTER Jack has signed up through the normal flow

-- Update Jack's profile to admin role
UPDATE profiles 
SET 
    role = 'admin',
    display_name = 'Jack Manning'
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'jackmanuelmanning@gmail.com'
);

-- Verify the update worked
SELECT 
    u.email,
    p.display_name,
    p.role,
    p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'jackmanuelmanning@gmail.com';

-- Create some initial invite codes for testing
INSERT INTO invite_codes (code, role, expires_at, created_by) 
SELECT 
    'ADMIN1', 'admin', now() + interval '30 days', p.id
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'jackmanuelmanning@gmail.com';

INSERT INTO invite_codes (code, role, expires_at, created_by) 
SELECT 
    'FAMILY', 'family', now() + interval '30 days', p.id
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'jackmanuelmanning@gmail.com';

INSERT INTO invite_codes (code, role, expires_at, created_by) 
SELECT 
    'FRIEND', 'friend', now() + interval '30 days', p.id
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'jackmanuelmanning@gmail.com';