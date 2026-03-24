-- Syntrax.ai Database Schema
-- Compatible with PostgreSQL / Supabase

-- Enable UUID extension if not enabled (Supabase usually has this by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations (Multi-tenancy)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- ex: 'acme-corp'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stripe_customer_id TEXT UNIQUE -- For payment integration
);

-- 2. Profiles (Linked to Supabase Auth)
-- Note: In Supabase, auth.users is in the 'auth' schema.
-- Ensure RLS (Row Level Security) is enabled in production.
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    org_id UUID REFERENCES organizations(id),
    role TEXT CHECK (role IN ('admin', 'member')) DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) UNIQUE,
    plan_type TEXT CHECK (plan_type IN ('starter', 'growth', 'scale')) NOT NULL,
    status TEXT CHECK (status IN ('active', 'past_due', 'canceled')) NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE,
    documents_processed_this_month INTEGER DEFAULT 0
);

-- 4. Documents (Metadata)
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) NOT NULL,
    uploaded_by UUID REFERENCES profiles(id),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL, -- Link to Storage (S3/Supabase Storage)
    status TEXT CHECK (status IN ('pending', 'processing', 'completed', 'failed')) DEFAULT 'pending',
    confidence_score FLOAT, -- AI Confidence (0 to 1)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Extractions (Structured Intelligence)
CREATE TABLE extractions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    data JSONB NOT NULL, -- Flexible schema for different document types
    extraction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. API Keys
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    key_hash TEXT NOT NULL, -- Store hashed keys only
    name TEXT NOT NULL, -- ex: "Production Key"
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_documents_org_id ON documents(org_id);
CREATE INDEX idx_extractions_document_id ON extractions(document_id);
CREATE INDEX idx_extractions_data_gin ON extractions USING GIN (data); -- For fast JSONB searching
