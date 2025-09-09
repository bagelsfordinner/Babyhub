-- Bootstrap function to create initial invite codes
-- This function bypasses RLS to create initial codes before any users exist
CREATE OR REPLACE FUNCTION create_bootstrap_invite_code(
    code_text TEXT,
    code_role TEXT,
    expires_timestamp TIMESTAMPTZ
) RETURNS UUID AS $$
DECLARE
    new_id UUID;
BEGIN
    -- Use a special bootstrap UUID for created_by
    INSERT INTO invite_codes (code, role, expires_at, created_by)
    VALUES (
        code_text,
        code_role,
        expires_timestamp,
        '00000000-0000-0000-0000-000000000000'::UUID
    )
    RETURNING id INTO new_id;
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;