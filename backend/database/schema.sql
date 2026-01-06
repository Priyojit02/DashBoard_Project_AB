-- ============================================
-- SUPABASE SQL SCHEMA
-- SAP Support Ticket Dashboard
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

-- Ticket Status
CREATE TYPE ticket_status AS ENUM (
    'Open',
    'In Progress',
    'Awaiting Info',
    'Resolved',
    'Closed'
);

-- Ticket Priority
CREATE TYPE ticket_priority AS ENUM (
    'Low',
    'Medium',
    'High',
    'Critical'
);

-- Ticket Category (SAP Modules)
CREATE TYPE ticket_category AS ENUM (
    'MM',      -- Material Management
    'SD',      -- Sales & Distribution
    'FICO',    -- Finance & Controlling
    'PP',      -- Production Planning
    'HCM',     -- Human Capital Management
    'PM',      -- Plant Maintenance
    'QM',      -- Quality Management
    'WM',      -- Warehouse Management
    'PS',      -- Project System
    'BW',      -- Business Warehouse
    'ABAP',    -- ABAP Development
    'BASIS',   -- Basis/Admin
    'OTHER'    -- Other/Unknown
);

-- Log Type
CREATE TYPE log_type AS ENUM (
    'status_change',
    'assignment',
    'priority_change',
    'created',
    'comment',
    'attachment',
    'email_received',
    'auto_classified'
);


-- ============================================
-- USERS TABLE
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    azure_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_azure_id ON users(azure_id);
CREATE INDEX idx_user_is_admin ON users(is_admin) WHERE is_admin = TRUE;

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


-- ============================================
-- TICKETS TABLE
-- ============================================

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,  -- T-001 format
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    status ticket_status DEFAULT 'Open' NOT NULL,
    priority ticket_priority DEFAULT 'Medium' NOT NULL,
    category ticket_category DEFAULT 'OTHER' NOT NULL,
    
    -- Foreign Keys
    created_by INTEGER NOT NULL REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    
    -- Email Source Info
    source_email_id VARCHAR(255),
    source_email_from VARCHAR(255),
    source_email_subject VARCHAR(500),
    
    -- LLM Classification Metadata
    llm_confidence FLOAT,
    llm_raw_response JSONB,
    
    -- SLA Fields
    sla_due_date TIMESTAMP WITH TIME ZONE,
    resolution_time INTEGER,  -- in minutes
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_ticket_status ON tickets(status);
CREATE INDEX idx_ticket_priority ON tickets(priority);
CREATE INDEX idx_ticket_category ON tickets(category);
CREATE INDEX idx_ticket_created_at ON tickets(created_at DESC);
CREATE INDEX idx_ticket_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_ticket_created_by ON tickets(created_by);
CREATE INDEX idx_ticket_ticket_id ON tickets(ticket_id);

-- Full-text search index
CREATE INDEX idx_ticket_search ON tickets USING gin(
    to_tsvector('english', title || ' ' || description)
);

CREATE TRIGGER tickets_updated_at
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


-- ============================================
-- TICKET LOGS TABLE
-- ============================================

CREATE TABLE ticket_logs (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    log_type log_type NOT NULL,
    action VARCHAR(500) NOT NULL,
    old_value VARCHAR(255),
    new_value VARCHAR(255),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_log_ticket_id ON ticket_logs(ticket_id);
CREATE INDEX idx_log_created_at ON ticket_logs(created_at DESC);
CREATE INDEX idx_log_user_id ON ticket_logs(user_id);


-- ============================================
-- TICKET COMMENTS TABLE
-- ============================================

CREATE TABLE ticket_comments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    author_id INTEGER NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_comment_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX idx_comment_created_at ON ticket_comments(created_at);
CREATE INDEX idx_comment_author_id ON ticket_comments(author_id);


-- ============================================
-- ATTACHMENTS TABLE
-- ============================================

CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    ticket_id INTEGER NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_size INTEGER NOT NULL,  -- in bytes
    storage_path VARCHAR(500) NOT NULL,
    storage_url VARCHAR(500),
    uploaded_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_attachment_ticket_id ON attachments(ticket_id);


-- ============================================
-- EMAIL SOURCES TABLE
-- ============================================

CREATE TABLE email_sources (
    id SERIAL PRIMARY KEY,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    from_address VARCHAR(255) NOT NULL,
    to_address VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    body_text TEXT,
    body_html TEXT,
    received_at TIMESTAMP WITH TIME ZONE NOT NULL,
    processed_at TIMESTAMP WITH TIME ZONE,
    is_sap_related BOOLEAN,
    detected_category VARCHAR(50),
    llm_analysis JSONB,
    ticket_created_id INTEGER REFERENCES tickets(id),
    error_message TEXT,
    raw_headers JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_email_message_id ON email_sources(message_id);
CREATE INDEX idx_email_received_at ON email_sources(received_at DESC);
CREATE INDEX idx_email_processed_at ON email_sources(processed_at);
CREATE INDEX idx_email_is_sap_related ON email_sources(is_sap_related) WHERE is_sap_related = TRUE;
CREATE INDEX idx_email_unprocessed ON email_sources(received_at) WHERE processed_at IS NULL;


-- ============================================
-- ADMIN AUDIT LOGS TABLE
-- ============================================

CREATE TABLE admin_audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_user_id INTEGER REFERENCES users(id),
    details JSONB,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes
CREATE INDEX idx_audit_admin_id ON admin_audit_logs(admin_id);
CREATE INDEX idx_audit_created_at ON admin_audit_logs(created_at DESC);
CREATE INDEX idx_audit_action ON admin_audit_logs(action);


-- ============================================
-- SYSTEM SETTINGS TABLE
-- ============================================

CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    value_type VARCHAR(50) DEFAULT 'string',  -- string, int, bool, json
    description TEXT,
    updated_by INTEGER REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Index
CREATE INDEX idx_setting_key ON system_settings(key);


-- ============================================
-- VIEWS
-- ============================================

-- Active Tickets View
CREATE VIEW active_tickets AS
SELECT 
    t.*,
    u1.name AS created_by_name,
    u1.email AS created_by_email,
    u2.name AS assigned_to_name,
    u2.email AS assigned_to_email
FROM tickets t
LEFT JOIN users u1 ON t.created_by = u1.id
LEFT JOIN users u2 ON t.assigned_to = u2.id
WHERE t.status NOT IN ('Resolved', 'Closed');


-- Ticket Statistics View
CREATE VIEW ticket_statistics AS
SELECT 
    status,
    priority,
    category,
    COUNT(*) as count
FROM tickets
GROUP BY status, priority, category;


-- User Ticket Summary View
CREATE VIEW user_ticket_summary AS
SELECT 
    u.id AS user_id,
    u.name,
    u.email,
    COUNT(DISTINCT t1.id) AS tickets_created,
    COUNT(DISTINCT t2.id) AS tickets_assigned,
    COUNT(DISTINCT CASE WHEN t2.status NOT IN ('Resolved', 'Closed') THEN t2.id END) AS open_assigned
FROM users u
LEFT JOIN tickets t1 ON t1.created_by = u.id
LEFT JOIN tickets t2 ON t2.assigned_to = u.id
GROUP BY u.id, u.name, u.email;


-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate next ticket ID
CREATE OR REPLACE FUNCTION generate_ticket_id()
RETURNS VARCHAR AS $$
DECLARE
    next_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(id), 0) + 1 INTO next_id FROM tickets;
    RETURN 'T-' || LPAD(next_id::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;


-- Function to calculate ticket resolution time
CREATE OR REPLACE FUNCTION calculate_resolution_time()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('Resolved', 'Closed') AND OLD.status NOT IN ('Resolved', 'Closed') THEN
        NEW.resolved_at = NOW();
        NEW.resolution_time = EXTRACT(EPOCH FROM (NOW() - NEW.created_at)) / 60;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_resolution_time
    BEFORE UPDATE ON tickets
    FOR EACH ROW
    EXECUTE FUNCTION calculate_resolution_time();


-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Note: In Supabase, you would add policies based on your authentication setup
-- Example policies (customize based on your needs):

-- Users can read all users (for assignment dropdowns)
CREATE POLICY "Users can view all users"
    ON users FOR SELECT
    USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON users FOR UPDATE
    USING (auth.uid()::text = azure_id);

-- All authenticated users can view tickets
CREATE POLICY "Authenticated users can view tickets"
    ON tickets FOR SELECT
    USING (true);

-- Users can create tickets
CREATE POLICY "Users can create tickets"
    ON tickets FOR INSERT
    WITH CHECK (true);

-- Users can update tickets they created or are assigned to
CREATE POLICY "Users can update their tickets"
    ON tickets FOR UPDATE
    USING (true);  -- Adjust based on your needs

-- Similar policies for other tables...


-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default system settings
INSERT INTO system_settings (key, value, value_type, description) VALUES
('email_fetch_enabled', 'true', 'bool', 'Enable automatic email fetching'),
('email_fetch_interval', '24', 'int', 'Email fetch interval in hours'),
('llm_enabled', 'true', 'bool', 'Enable LLM for email classification'),
('auto_create_tickets', 'true', 'bool', 'Automatically create tickets from SAP emails'),
('sla_default_hours', '48', 'int', 'Default SLA time in hours');


-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users (Supabase role)
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant admin permissions (service role)
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;


-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE users IS 'User accounts synchronized with Azure AD';
COMMENT ON TABLE tickets IS 'Support tickets for SAP-related issues';
COMMENT ON TABLE ticket_logs IS 'Activity log for ticket changes';
COMMENT ON TABLE ticket_comments IS 'Comments and discussions on tickets';
COMMENT ON TABLE attachments IS 'File attachments for tickets';
COMMENT ON TABLE email_sources IS 'Emails fetched via IMAP for processing';
COMMENT ON TABLE admin_audit_logs IS 'Audit trail for admin actions';
COMMENT ON TABLE system_settings IS 'Application configuration settings';

COMMENT ON COLUMN tickets.ticket_id IS 'Human-readable ticket ID (T-001 format)';
COMMENT ON COLUMN tickets.category IS 'SAP module category detected by LLM';
COMMENT ON COLUMN tickets.llm_confidence IS 'Confidence score from LLM classification (0-1)';
COMMENT ON COLUMN email_sources.is_sap_related IS 'Whether email was classified as SAP-related';
