-- Initial schema setup for Confyde Drug Discovery Platform
-- This script creates all necessary tables and sets up RLS policies

-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  company_id UUID REFERENCES companies(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create scenarios table
CREATE TABLE scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  project_id UUID REFERENCES projects(id),
  company_id UUID REFERENCES companies(id),
  sample_size INTEGER DEFAULT 0,
  inclusion_criteria TEXT,
  investigational_arm TEXT,
  control_arm TEXT,
  primary_end_point TEXT,
  secondary_end_point TEXT,
  exploratory_end_point TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add initial company
INSERT INTO companies (name) VALUES ('Confyde Test');

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
-- Only allow users to see their own user data and users from the same company (for admins in the future)
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    company_id IN (
      SELECT company_id FROM users WHERE user_id = auth.uid()
    )
  );

-- Only allow users to update their own data
CREATE POLICY users_update_policy ON users
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow new users to be created (will be done at signup)
CREATE POLICY users_insert_policy ON users
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for projects table
-- Users can only see projects from their company
CREATE POLICY projects_select_policy ON projects
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE user_id = auth.uid()
    )
  );

-- Users can only create projects for their company
CREATE POLICY projects_insert_policy ON projects
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE user_id = auth.uid()
    ) AND
    created_by = auth.uid()
  );

-- Users can only update projects from their company
CREATE POLICY projects_update_policy ON projects
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for scenarios table
-- Users can only see scenarios from their company
CREATE POLICY scenarios_select_policy ON scenarios
  FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE user_id = auth.uid()
    )
  );

-- Users can only create scenarios for their company
CREATE POLICY scenarios_insert_policy ON scenarios
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users WHERE user_id = auth.uid()
    )
  );

-- Users can only update scenarios from their company
CREATE POLICY scenarios_update_policy ON scenarios
  FOR UPDATE
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE user_id = auth.uid()
    )
  );

-- Create RLS policies for companies table
-- Any authenticated user can view companies
CREATE POLICY companies_select_policy ON companies
  FOR SELECT
  USING (true);

-- Only allow superusers to insert/update companies (not implemented yet but a good practice)
-- For now, companies management would be handled manually by DB admin 


-- Drop the recursive policy that's causing problems
DROP POLICY IF EXISTS users_select_policy ON users;

-- Create a simpler policy for users table that avoids recursion
CREATE POLICY users_select_policy ON users
  FOR SELECT
  USING (auth.uid() = user_id);