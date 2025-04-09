-- Add additional fields to scenarios table for clinical trial data
-- This script adds status and end_date fields to store imported clinical trial data

-- Add status field (Active, Completed, Recruiting, etc.)
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS status TEXT;

-- Add end_date field to track clinical trial completion date
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS end_date DATE;

-- Add exclusion_criteria field to store the exclusion criteria from clinical trials
ALTER TABLE scenarios ADD COLUMN IF NOT EXISTS exclusion_criteria TEXT;

COMMENT ON COLUMN scenarios.status IS 'Status of the clinical trial (e.g., ACTIVE, COMPLETED, RECRUITING)';
COMMENT ON COLUMN scenarios.end_date IS 'Expected or actual completion date of the trial';
COMMENT ON COLUMN scenarios.exclusion_criteria IS 'Criteria for excluding participants from the trial'; 