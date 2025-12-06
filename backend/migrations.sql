-- Create enum types
DO $$ BEGIN
    CREATE TYPE share_permission_level AS ENUM ('view', 'download', 'edit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE share_link_status AS ENUM ('active', 'expired', 'revoked');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE file_permission_type AS ENUM ('owner', 'editor', 'viewer', 'downloader');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create shared_links table
CREATE TABLE IF NOT EXISTS shared_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    statement_id UUID NOT NULL,
    user_id UUID NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    permission share_permission_level DEFAULT 'view',
    expires_at TIMESTAMP NULL,
    password VARCHAR NULL,
    status share_link_status DEFAULT 'active',
    access_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP NULL,
    allow_anonymous BOOLEAN DEFAULT true,
    description TEXT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_shared_links_statement FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE,
    CONSTRAINT fk_shared_links_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for shared_links
CREATE INDEX IF NOT EXISTS idx_shared_links_token ON shared_links(token);
CREATE INDEX IF NOT EXISTS idx_shared_links_statement_id ON shared_links(statement_id);
CREATE INDEX IF NOT EXISTS idx_shared_links_user_id ON shared_links(user_id);

-- Create file_permissions table
CREATE TABLE IF NOT EXISTS file_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    statement_id UUID NOT NULL,
    user_id UUID NOT NULL,
    granted_by_id UUID NOT NULL,
    permission_type file_permission_type DEFAULT 'viewer',
    can_reshare BOOLEAN DEFAULT false,
    expires_at TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT fk_file_permissions_statement FOREIGN KEY (statement_id) REFERENCES statements(id) ON DELETE CASCADE,
    CONSTRAINT fk_file_permissions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_file_permissions_granted_by FOREIGN KEY (granted_by_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(statement_id, user_id)
);

-- Create indexes for file_permissions
CREATE INDEX IF NOT EXISTS idx_file_permissions_statement_id ON file_permissions(statement_id);
CREATE INDEX IF NOT EXISTS idx_file_permissions_user_id ON file_permissions(user_id);




