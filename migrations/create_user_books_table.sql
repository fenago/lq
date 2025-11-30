-- Create user_books table to track books/repos created through the platform
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_books (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  github_repo_name TEXT NOT NULL,
  github_repo_url TEXT,
  github_pages_url TEXT,
  github_username TEXT NOT NULL,
  chapters JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'deployed', 'failed')),
  last_deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_books ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own books" ON user_books
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own books" ON user_books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own books" ON user_books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own books" ON user_books
  FOR DELETE USING (auth.uid() = user_id);

-- Super admins can view all books
CREATE POLICY "Super admins can view all books" ON user_books
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.platform_role = 'super_admin'
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_user_books_user_id ON user_books(user_id);
CREATE INDEX idx_user_books_status ON user_books(status);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_books_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_books_updated_at
  BEFORE UPDATE ON user_books
  FOR EACH ROW
  EXECUTE FUNCTION update_user_books_updated_at();
