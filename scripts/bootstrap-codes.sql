-- Bootstrap invite codes directly in Supabase
-- Run this SQL in your Supabase SQL Editor

-- Temporarily allow NULL for created_by
ALTER TABLE invite_codes ALTER COLUMN created_by DROP NOT NULL;

-- Insert initial invite codes
INSERT INTO invite_codes (code, role, expires_at, created_by) VALUES 
('ADMIN1', 'admin', NOW() + INTERVAL '30 days', NULL),
('FAMILY', 'family', NOW() + INTERVAL '30 days', NULL),
('FRIEND', 'friend', NOW() + INTERVAL '30 days', NULL)
ON CONFLICT (code) DO NOTHING;

-- Restore NOT NULL constraint (for future codes created by real users)
-- ALTER TABLE invite_codes ALTER COLUMN created_by SET NOT NULL;

-- View the created codes
SELECT code, role, expires_at FROM invite_codes ORDER BY created_at DESC;