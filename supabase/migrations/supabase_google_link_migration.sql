-- Create a table to link Google accounts to Supabase users
CREATE TABLE IF NOT EXISTS google_account_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  google_sub TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_google_account_links_user_id ON google_account_links(user_id);
CREATE INDEX IF NOT EXISTS idx_google_account_links_google_sub ON google_account_links(google_sub);

-- Enable RLS
ALTER TABLE google_account_links ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own Google links
CREATE POLICY "Users can view own Google links"
  ON google_account_links
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own Google links
CREATE POLICY "Users can insert own Google links"
  ON google_account_links
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
