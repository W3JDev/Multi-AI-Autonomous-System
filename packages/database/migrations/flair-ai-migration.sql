-- ============================================================================
-- FlairAi Migration Script
-- ============================================================================
-- Migrates from existing Supabase FlairAi database to unified schema
--
-- Usage:
--   psql $NEW_DATABASE_URL -f flair-ai-migration.sql
--
-- Prerequisites:
--   - Set up dblink extension to connect to old database
--   - Replace connection string placeholders with actual values
-- ============================================================================

-- Enable dblink extension for cross-database queries
CREATE EXTENSION IF NOT EXISTS dblink;

-- ============================================================================
-- Step 1: Create temporary connection to old FlairAi database
-- ============================================================================
-- Note: Replace 'OLD_FLAIR_AI_CONNECTION_STRING' with actual connection string

-- Example:
-- SELECT dblink_connect('old_flair', 'host=localhost dbname=flair_ai user=postgres password=yourpass');

-- ============================================================================
-- Step 2: Migrate Organization (assuming one organization)
-- ============================================================================

DO $$
DECLARE
  v_org_id TEXT;
BEGIN
  -- Create or get organization
  INSERT INTO organizations (id, name, slug, plan, status, created_at, updated_at)
  VALUES (
    gen_random_uuid()::TEXT,
    'FlairAi Migrated Organization',
    'flair-ai-migrated',
    'PRO',
    'ACTIVE',
    NOW(),
    NOW()
  )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_org_id;
  
  -- Store org_id for later use
  CREATE TEMP TABLE IF NOT EXISTS migration_context (
    org_id TEXT
  );
  
  IF v_org_id IS NULL THEN
    SELECT id INTO v_org_id FROM organizations WHERE slug = 'flair-ai-migrated';
  END IF;
  
  INSERT INTO migration_context VALUES (v_org_id);
  
  RAISE NOTICE 'Organization ID: %', v_org_id;
END $$;

-- ============================================================================
-- Step 3: Migrate Users
-- ============================================================================

-- Assuming old database has a users table with similar structure
-- Adjust field mappings as needed

/*
INSERT INTO users (id, organization_id, email, name, password_hash, role, status, created_at, updated_at)
SELECT 
  old_users.id,
  (SELECT org_id FROM migration_context),
  old_users.email,
  old_users.name,
  old_users.password_hash,
  COALESCE(old_users.role, 'MEMBER'),
  COALESCE(old_users.status, 'ACTIVE'),
  COALESCE(old_users.created_at, NOW()),
  COALESCE(old_users.updated_at, NOW())
FROM dblink('old_flair', 'SELECT id, email, name, password_hash, role, status, created_at, updated_at FROM users') 
  AS old_users(
    id TEXT,
    email TEXT,
    name TEXT,
    password_hash TEXT,
    role TEXT,
    status TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
  )
ON CONFLICT (email) DO NOTHING;
*/

-- ============================================================================
-- Step 4: Migrate Training Programs
-- ============================================================================

/*
INSERT INTO training_programs (
  id,
  organization_id,
  name,
  description,
  language,
  scenarios,
  difficulty,
  duration,
  is_active,
  created_at,
  updated_at
)
SELECT 
  old_programs.id,
  (SELECT org_id FROM migration_context),
  old_programs.name,
  old_programs.description,
  COALESCE(old_programs.language, 'en'),
  COALESCE(old_programs.scenarios, '[]'::jsonb),
  COALESCE(old_programs.difficulty, 'BEGINNER'),
  COALESCE(old_programs.duration, 60),
  COALESCE(old_programs.is_active, true),
  COALESCE(old_programs.created_at, NOW()),
  COALESCE(old_programs.updated_at, NOW())
FROM dblink('old_flair', '
  SELECT 
    id, name, description, language, scenarios, 
    difficulty, duration, is_active, created_at, updated_at 
  FROM training_modules
') AS old_programs(
  id TEXT,
  name TEXT,
  description TEXT,
  language TEXT,
  scenarios JSONB,
  difficulty TEXT,
  duration INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================================
-- Step 5: Migrate Staff Members
-- ============================================================================

/*
INSERT INTO staff_members (
  id,
  user_id,
  organization_id,
  first_name,
  last_name,
  role,
  language,
  skill_level,
  created_at,
  updated_at
)
SELECT 
  old_staff.id,
  old_staff.user_id,
  (SELECT org_id FROM migration_context),
  old_staff.first_name,
  old_staff.last_name,
  COALESCE(old_staff.role, 'Staff'),
  COALESCE(old_staff.language, 'en'),
  COALESCE(old_staff.skill_level, 'BEGINNER'),
  COALESCE(old_staff.created_at, NOW()),
  COALESCE(old_staff.updated_at, NOW())
FROM dblink('old_flair', '
  SELECT 
    id, user_id, first_name, last_name, role, 
    language, skill_level, created_at, updated_at 
  FROM staff_members
') AS old_staff(
  id TEXT,
  user_id TEXT,
  first_name TEXT,
  last_name TEXT,
  role TEXT,
  language TEXT,
  skill_level TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
ON CONFLICT (user_id) DO NOTHING;
*/

-- ============================================================================
-- Step 6: Migrate Training Sessions
-- ============================================================================

/*
INSERT INTO training_sessions (
  id,
  program_id,
  staff_id,
  start_time,
  end_time,
  score,
  performance,
  completed,
  created_at,
  updated_at
)
SELECT 
  old_sessions.id,
  old_sessions.program_id,
  old_sessions.staff_id,
  old_sessions.start_time,
  old_sessions.end_time,
  old_sessions.score,
  COALESCE(old_sessions.performance, '{}'::jsonb),
  COALESCE(old_sessions.completed, false),
  COALESCE(old_sessions.created_at, NOW()),
  COALESCE(old_sessions.updated_at, NOW())
FROM dblink('old_flair', '
  SELECT 
    id, program_id, staff_id, start_time, end_time, 
    score, performance, completed, created_at, updated_at 
  FROM training_sessions
') AS old_sessions(
  id TEXT,
  program_id TEXT,
  staff_id TEXT,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  score INTEGER,
  performance JSONB,
  completed BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================================
-- Step 7: Migrate Assessments
-- ============================================================================

/*
INSERT INTO assessments (
  id,
  session_id,
  staff_id,
  score,
  feedback,
  passed_at,
  created_at,
  updated_at
)
SELECT 
  old_assessments.id,
  old_assessments.session_id,
  old_assessments.staff_id,
  old_assessments.score,
  old_assessments.feedback,
  old_assessments.passed_at,
  COALESCE(old_assessments.created_at, NOW()),
  COALESCE(old_assessments.updated_at, NOW())
FROM dblink('old_flair', '
  SELECT 
    id, session_id, staff_id, score, feedback, 
    passed_at, created_at, updated_at 
  FROM assessments
') AS old_assessments(
  id TEXT,
  session_id TEXT,
  staff_id TEXT,
  score INTEGER,
  feedback TEXT,
  passed_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
ON CONFLICT (id) DO NOTHING;
*/

-- ============================================================================
-- Step 8: Cleanup
-- ============================================================================

-- Disconnect from old database
-- SELECT dblink_disconnect('old_flair');

-- Drop temporary table
DROP TABLE IF EXISTS migration_context;

-- ============================================================================
-- Verification Queries
-- ============================================================================

-- Check migrated data counts
/*
SELECT 
  'organizations' as table_name, 
  COUNT(*) as count 
FROM organizations WHERE slug = 'flair-ai-migrated'

UNION ALL

SELECT 
  'training_programs', 
  COUNT(*) 
FROM training_programs 
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'flair-ai-migrated')

UNION ALL

SELECT 
  'staff_members', 
  COUNT(*) 
FROM staff_members 
WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'flair-ai-migrated')

UNION ALL

SELECT 
  'training_sessions', 
  COUNT(*) 
FROM training_sessions 
WHERE staff_id IN (
  SELECT id FROM staff_members 
  WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'flair-ai-migrated')
)

UNION ALL

SELECT 
  'assessments', 
  COUNT(*) 
FROM assessments 
WHERE staff_id IN (
  SELECT id FROM staff_members 
  WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'flair-ai-migrated')
);
*/

-- ============================================================================
-- NOTES
-- ============================================================================
-- 
-- 1. This script uses dblink to connect to the old database.
--    Install: CREATE EXTENSION dblink;
-- 
-- 2. Uncomment the INSERT statements and adjust field mappings based on
--    your actual old schema structure.
-- 
-- 3. Replace 'old_flair' connection and table names with actual values.
-- 
-- 4. Test on a development database first!
-- 
-- 5. Consider running in a transaction:
--    BEGIN;
--    -- run migration
--    ROLLBACK; -- or COMMIT; when ready
-- 
-- ============================================================================
