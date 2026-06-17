-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE life_category AS ENUM ('Travel','Relationship','Career','Health','Goals','Other');
CREATE TYPE mood_type     AS ENUM ('Happy','Sad','Excited','Nostalgic','Grateful','Anxious','Peaceful','Other');
CREATE TYPE media_type    AS ENUM ('image','video','audio');

-- auto-update trigger (reused by all tables)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    avatar_public_id TEXT,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- email verification
    email_verified             BOOLEAN     NOT NULL DEFAULT FALSE,
    email_verification_token   TEXT,
    email_verify_token_expiry  TIMESTAMPTZ,

    -- session management
    refresh_token              TEXT,

    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- CREATE INDEX idx_events_user_id ON events (user_id);

-- EVENTS
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category life_category NOT NULL,
    cover_image_url TEXT,
    cover_image_public_id TEXT,
    is_private BOOLEAN NOT NULL DEFAULT TRUE,
    is_ongoing BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INT NOT NULL DEFAULT 0,
    started_at DATE,
    ended_at DATE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_events_updated_at
  BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_events_user_id ON events(user_id);

-- MEMORY ENTRIES
CREATE TABLE memory_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES memory_entries(id) ON DELETE SET NULL,
    title VARCHAR(255),
    body TEXT,
    chapter VARCHAR(100),
    mood mood_type,
    mood_score SMALLINT CHECK (mood_score BETWEEN 1 AND 10),
    location_name VARCHAR(255),
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    memory_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_memory_entries_updated_at
  BEFORE UPDATE ON memory_entries FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_memory_entries_event_id ON memory_entries(event_id);
CREATE INDEX idx_memory_entries_parent_id ON memory_entries(parent_id);
CREATE INDEX idx_memory_entries_date ON memory_entries(memory_date DESC);

-- MEDIA
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    memory_entry_id UUID NOT NULL REFERENCES memory_entries(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    public_id TEXT NOT NULL,
    media_type media_type NOT NULL,
    caption TEXT,
    file_size_bytes INT,
    mime_type VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_media_memory_entry_id ON media(memory_entry_id);