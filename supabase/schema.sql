-- Run this in Supabase SQL Editor

-- LEADS table: Step 1 form submission
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  ip_address VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  -- status values: pending | payment_submitted | approved | rejected
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Tracking columns
  source VARCHAR(50) DEFAULT 'direct',
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(255),
  user_agent TEXT,
  gclid VARCHAR(255),  -- Google click ID (from ?gclid= param)
  fbclid VARCHAR(255), -- Meta click ID (from ?fbclid= param)
  
  -- Access Tracking
  access_sent BOOLEAN DEFAULT FALSE,
  access_sent_at TIMESTAMPTZ
);

-- ==========================================
-- RUN THIS MIGRATION IF TABLE ALREADY EXISTS:
-- ==========================================
-- ALTER TABLE leads 
--   ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'direct',
--   ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(100),
--   ADD COLUMN IF NOT EXISTS utm_campaign VARCHAR(100),
--   ADD COLUMN IF NOT EXISTS utm_content VARCHAR(255),
--   ADD COLUMN IF NOT EXISTS user_agent TEXT,
--   ADD COLUMN IF NOT EXISTS gclid VARCHAR(255),
--   ADD COLUMN IF NOT EXISTS fbclid VARCHAR(255);
-- ==========================================

-- PAYMENTS table: Step 3 screenshot submission
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
  screenshot_url TEXT,
  image_hash VARCHAR(64) UNIQUE, -- SHA-256 to prevent duplicate screenshots
  transaction_id VARCHAR(100),   -- extracted by AI, used for dedup
  amount NUMERIC,
  recipient_number VARCHAR(30),  -- the TO account in screenshot
  sender_name VARCHAR(100),
  direction VARCHAR(20),         -- 'sent' | 'received'
  ai_verified BOOLEAN DEFAULT FALSE,
  ai_result JSONB,               -- full Gemini response
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  admin_approved BOOLEAN,
  admin_note TEXT,
  approved_at TIMESTAMPTZ,
  approved_by VARCHAR(50)
);

-- ADMIN SESSIONS: simple token-based admin auth
CREATE TABLE IF NOT EXISTS admin_sessions (
  token VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_created_idx ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS payments_lead_id_idx ON payments(lead_id);
CREATE INDEX IF NOT EXISTS payments_tx_id_idx ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS payments_hash_idx ON payments(image_hash);

-- Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Only service role can access (admin + API routes)
CREATE POLICY "Service role only" ON leads FOR ALL USING (false);
CREATE POLICY "Service role only" ON payments FOR ALL USING (false);
