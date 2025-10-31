-- ============================================================================
-- SEED DATA FOR DEVELOPMENT (Fixed + Safe Version)
-- ============================================================================

-- Insert sample users
INSERT INTO users (id, email, full_name, role, status)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'admin@nodeops.com', 'Admin User', 'admin', 'online'),
  ('550e8400-e29b-41d4-a716-446655440002', 'john@nodeops.com', 'John Doe', 'member', 'online'),
  ('550e8400-e29b-41d4-a716-446655440003', 'jane@nodeops.com', 'Jane Smith', 'member', 'away'),
  ('550e8400-e29b-41d4-a716-446655440004', 'bob@nodeops.com', 'Bob Johnson', 'member', 'offline')
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (id, name, description, icon, color, owner_id)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'NodeOps Platform', 'Main platform development', '🚀', 'blue', '550e8400-e29b-41d4-a716-446655440001'),
  ('650e8400-e29b-41d4-a716-446655440002', 'Marketing Campaign', 'Q4 2025 marketing initiatives', '📢', 'purple', '550e8400-e29b-41d4-a716-446655440002'),
  ('650e8400-e29b-41d4-a716-446655440003', 'Customer Support', 'Support ticket management', '🎯', 'green', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Insert project members
INSERT INTO project_members (project_id, user_id, role)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'editor'),
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'editor'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'owner'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 'viewer'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'owner'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'editor')
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (id, title, description, status, priority, project_id, assignee_id, created_by, due_date, tags)
VALUES
  ('750e8400-e29b-41d4-a716-446655440001', 'Setup database schema', 'Create initial Supabase schema', 'done', 'high', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '2025-11-15', ARRAY['backend', 'database']),
  ('750e8400-e29b-41d4-a716-446655440002', 'Build API endpoints', 'Create REST API for tasks', 'in-progress', 'high', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '2025-11-20', ARRAY['backend', 'api']),
  ('750e8400-e29b-41d4-a716-446655440003', 'Design UI components', 'Create reusable React components', 'in-progress', 'medium', '650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '2025-11-18', ARRAY['frontend', 'ui']),
  ('750e8400-e29b-41d4-a716-446655440004', 'Write documentation', 'API and setup documentation', 'todo', 'low', '650e8400-e29b-41d4-a716-446655440001', NULL, '550e8400-e29b-41d4-a716-446655440001', '2025-11-25', ARRAY['documentation']),
  ('750e8400-e29b-41d4-a716-446655440005', 'Launch social media campaign', 'Create posts and schedule', 'todo', 'high', '650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', '2025-11-10', ARRAY['marketing', 'social']),
  ('750e8400-e29b-41d4-a716-446655440006', 'Review support tickets', 'Triage and assign tickets', 'in-progress', 'medium', '650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '2025-11-05', ARRAY['support'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample task comments
INSERT INTO task_comments (task_id, user_id, content)
VALUES
  ('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Schema looks good, ready for migration'),
  ('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Great progress on the API! Let me review the endpoints'),
  ('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Components are looking clean and reusable')
ON CONFLICT DO NOTHING;

-- Insert sample team members
INSERT INTO team_members (project_id, user_id, name, email, role, status, department, position)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Admin User', 'admin@nodeops.com', 'admin', 'online', 'Engineering', 'Tech Lead'),
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'John Doe', 'john@nodeops.com', 'member', 'online', 'Engineering', 'Backend Developer'),
  ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Jane Smith', 'jane@nodeops.com', 'member', 'away', 'Design', 'UI/UX Designer'),
  ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'John Doe', 'john@nodeops.com', 'admin', 'online', 'Marketing', 'Marketing Manager'),
  ('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Jane Smith', 'jane@nodeops.com', 'member', 'away', 'Support', 'Support Specialist')
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Insert sample task labels
INSERT INTO task_labels (project_id, name, color)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'bug', 'red'),
  ('650e8400-e29b-41d4-a716-446655440001', 'feature', 'blue'),
  ('650e8400-e29b-41d4-a716-446655440001', 'documentation', 'green'),
  ('650e8400-e29b-41d4-a716-446655440001', 'urgent', 'orange'),
  ('650e8400-e29b-41d4-a716-446655440002', 'campaign', 'purple'),
  ('650e8400-e29b-41d4-a716-446655440002', 'review', 'yellow')
ON CONFLICT (project_id, name) DO NOTHING;

-- Insert sample views
INSERT INTO views (project_id, name, view_type, created_by, is_default)
VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'All Tasks', 'table', '550e8400-e29b-41d4-a716-446655440001', TRUE),
  ('650e8400-e29b-41d4-a716-446655440001', 'Kanban Board', 'kanban', '550e8400-e29b-41d4-a716-446655440001', FALSE),
  ('650e8400-e29b-41d4-a716-446655440001', 'Timeline', 'calendar', '550e8400-e29b-41d4-a716-446655440001', FALSE),
  ('650e8400-e29b-41d4-a716-446655440002', 'Campaign Tasks', 'table', '550e8400-e29b-41d4-a716-446655440002', TRUE)
ON CONFLICT (project_id, name) DO NOTHING;
