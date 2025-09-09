-- Little Logbook Database Schema
-- Run this in your Supabase SQL editor

-- User profiles extending Supabase auth
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('admin', 'family', 'friend')) DEFAULT 'friend',
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by authenticated users" ON profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can update any profile" ON profiles
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Invite codes for authentication
CREATE TABLE invite_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'family', 'friend')) DEFAULT 'friend',
    expires_at TIMESTAMPTZ NOT NULL,
    used_by UUID REFERENCES auth.users ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Policies for invite_codes
CREATE POLICY "Admins can view all invite codes" ON invite_codes
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Admins can create invite codes" ON invite_codes
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Anyone can read unused, non-expired invite codes for verification" ON invite_codes
    FOR SELECT USING (
        used_by IS NULL AND expires_at > now()
    );

-- Timeline events for organization
CREATE TABLE timeline_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    event_date DATE NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Policies for timeline_events
CREATE POLICY "Timeline events are viewable by authenticated users" ON timeline_events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and family can create timeline events" ON timeline_events
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'family')
        )
    );

CREATE POLICY "Admins can update any timeline event" ON timeline_events
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Users can update their own timeline events" ON timeline_events
    FOR UPDATE USING (auth.uid() = created_by);

-- Media with simple organization
CREATE TABLE media (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    caption TEXT,
    type TEXT NOT NULL CHECK (type IN ('photo', 'video')) DEFAULT 'photo',
    uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_date DATE,
    age_tag TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Policies for media
CREATE POLICY "Media is viewable by authenticated users" ON media
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and family can upload media" ON media
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'family')
        )
    );

CREATE POLICY "Admins can update any media" ON media
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

CREATE POLICY "Users can update their own media" ON media
    FOR UPDATE USING (auth.uid() = uploaded_by);

-- Comments system
CREATE TABLE comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Policies for comments
CREATE POLICY "Comments are viewable by authenticated users" ON comments
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments" ON comments
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can update any comment" ON comments
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Help coordination
CREATE TABLE help_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('counter', 'task', 'registry')) DEFAULT 'task',
    target_count INTEGER,
    current_count INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    category TEXT,
    created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE help_items ENABLE ROW LEVEL SECURITY;

-- Policies for help_items
CREATE POLICY "Help items are viewable by authenticated users" ON help_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and family can create help items" ON help_items
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'family')
        )
    );

CREATE POLICY "Admins and family can update help items" ON help_items
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'family')
        )
    );

-- Memory vault entries
CREATE TABLE vault_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('letter', 'recommendation', 'memory', 'advice')) DEFAULT 'memory',
    recipient TEXT NOT NULL CHECK (recipient IN ('baby', 'parents')) DEFAULT 'baby',
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE vault_entries ENABLE ROW LEVEL SECURITY;

-- Policies for vault_entries
CREATE POLICY "Vault entries are viewable by admins and family" ON vault_entries
    FOR SELECT USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role IN ('admin', 'family')
        )
    );

CREATE POLICY "Authenticated users can create vault entries" ON vault_entries
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own vault entries" ON vault_entries
    FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Admins can update any vault entry" ON vault_entries
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT id FROM profiles WHERE role = 'admin'
        )
    );

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        'friend'  -- Default role, will be updated based on invite code
    );
    RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate random invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
    END LOOP;
    
    -- Check if code already exists, if so regenerate
    WHILE EXISTS(SELECT 1 FROM invite_codes WHERE code = result) LOOP
        result := '';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_invite_codes_code ON invite_codes(code);
CREATE INDEX idx_invite_codes_expires_at ON invite_codes(expires_at);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by);
CREATE INDEX idx_media_event_date ON media(event_date);
CREATE INDEX idx_comments_media_id ON comments(media_id);
CREATE INDEX idx_timeline_events_event_date ON timeline_events(event_date);
CREATE INDEX idx_help_items_completed ON help_items(completed);
CREATE INDEX idx_vault_entries_author_id ON vault_entries(author_id);
CREATE INDEX idx_vault_entries_type ON vault_entries(type);