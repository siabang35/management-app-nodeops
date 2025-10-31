-- ============================================================================
-- UTILITY FUNCTIONS FOR COMMON OPERATIONS
-- ============================================================================

-- ============================================================================
-- Get task statistics for a project
-- ============================================================================
CREATE OR REPLACE FUNCTION get_project_task_stats(p_project_id UUID)
RETURNS TABLE (
  total_tasks BIGINT,
  completed_tasks BIGINT,
  in_progress_tasks BIGINT,
  todo_tasks BIGINT,
  high_priority_tasks BIGINT,
  overdue_tasks BIGINT,
  completion_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_tasks,
    COUNT(*) FILTER (WHERE status = 'done')::BIGINT as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'in-progress')::BIGINT as in_progress_tasks,
    COUNT(*) FILTER (WHERE status = 'todo')::BIGINT as todo_tasks,
    COUNT(*) FILTER (WHERE priority = 'high')::BIGINT as high_priority_tasks,
    COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'done')::BIGINT as overdue_tasks,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'done')::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100,
      2
    ) as completion_percentage
  FROM tasks
  WHERE project_id = p_project_id AND is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Get team member statistics
-- ============================================================================
CREATE OR REPLACE FUNCTION get_team_member_stats(p_project_id UUID, p_user_id UUID)
RETURNS TABLE (
  assigned_tasks BIGINT,
  completed_tasks BIGINT,
  in_progress_tasks BIGINT,
  overdue_tasks BIGINT,
  average_completion_time INTERVAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as assigned_tasks,
    COUNT(*) FILTER (WHERE status = 'done')::BIGINT as completed_tasks,
    COUNT(*) FILTER (WHERE status = 'in-progress')::BIGINT as in_progress_tasks,
    COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status != 'done')::BIGINT as overdue_tasks,
    AVG(EXTRACT(EPOCH FROM (completed_at - created_at)))::INTERVAL as average_completion_time
  FROM tasks
  WHERE project_id = p_project_id
  AND assignee_id = p_user_id
  AND is_archived = false;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Get project members with their task counts
-- ============================================================================
CREATE OR REPLACE FUNCTION get_project_members_with_stats(p_project_id UUID)
RETURNS TABLE (
  user_id UUID,
  name VARCHAR,
  email VARCHAR,
  role VARCHAR,
  assigned_tasks BIGINT,
  completed_tasks BIGINT,
  in_progress_tasks BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    tm.user_id,
    tm.name,
    tm.email,
    tm.role,
    COUNT(t.id) FILTER (WHERE t.assignee_id = tm.user_id)::BIGINT as assigned_tasks,
    COUNT(t.id) FILTER (WHERE t.assignee_id = tm.user_id AND t.status = 'done')::BIGINT as completed_tasks,
    COUNT(t.id) FILTER (WHERE t.assignee_id = tm.user_id AND t.status = 'in-progress')::BIGINT as in_progress_tasks
  FROM team_members tm
  LEFT JOIN tasks t ON t.project_id = tm.project_id
  WHERE tm.project_id = p_project_id
  GROUP BY tm.user_id, tm.name, tm.email, tm.role;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Search tasks across project
-- ============================================================================
CREATE OR REPLACE FUNCTION search_project_tasks(
  p_project_id UUID,
  p_search_query TEXT,
  p_status VARCHAR DEFAULT NULL,
  p_priority VARCHAR DEFAULT NULL,
  p_assignee_id UUID DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  description TEXT,
  status VARCHAR,
  priority VARCHAR,
  assignee_id UUID,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.assignee_id,
    t.due_date,
    t.created_at
  FROM tasks t
  WHERE t.project_id = p_project_id
  AND t.is_archived = false
  AND (
    p_search_query IS NULL
    OR t.title ILIKE '%' || p_search_query || '%'
    OR t.description ILIKE '%' || p_search_query || '%'
  )
  AND (p_status IS NULL OR t.status = p_status)
  AND (p_priority IS NULL OR t.priority = p_priority)
  AND (p_assignee_id IS NULL OR t.assignee_id = p_assignee_id)
  ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Get upcoming tasks (due in next N days)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_upcoming_tasks(
  p_project_id UUID,
  p_days_ahead INTEGER DEFAULT 7
)
RETURNS TABLE (
  id UUID,
  title VARCHAR,
  status VARCHAR,
  priority VARCHAR,
  assignee_id UUID,
  due_date DATE,
  days_until_due INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.title,
    t.status,
    t.priority,
    t.assignee_id,
    t.due_date,
    (t.due_date - CURRENT_DATE)::INTEGER as days_until_due
  FROM tasks t
  WHERE t.project_id = p_project_id
  AND t.is_archived = false
  AND t.status != 'done'
  AND t.due_date IS NOT NULL
  AND t.due_date BETWEEN CURRENT_DATE AND CURRENT_DATE + (p_days_ahead || ' days')::INTERVAL
  ORDER BY t.due_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Get project activity summary
-- ============================================================================
CREATE OR REPLACE FUNCTION get_project_activity_summary(
  p_project_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  action VARCHAR,
  entity_type VARCHAR,
  count BIGINT,
  last_activity TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.action,
    al.entity_type,
    COUNT(*)::BIGINT as count,
    MAX(al.created_at) as last_activity
  FROM activity_logs al
  WHERE al.project_id = p_project_id
  AND al.created_at >= CURRENT_TIMESTAMP - (p_days_back || ' days')::INTERVAL
  GROUP BY al.action, al.entity_type
  ORDER BY last_activity DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Get task completion trend (tasks completed per day)
-- ============================================================================
CREATE OR REPLACE FUNCTION get_task_completion_trend(
  p_project_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  completion_date DATE,
  tasks_completed BIGINT,
  cumulative_completed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH daily_completions AS (
    SELECT
      DATE(completed_at) as completion_date,
      COUNT(*)::BIGINT as tasks_completed
    FROM tasks
    WHERE project_id = p_project_id
    AND completed_at IS NOT NULL
    AND completed_at >= CURRENT_TIMESTAMP - (p_days_back || ' days')::INTERVAL
    GROUP BY DATE(completed_at)
  )
  SELECT
    dc.completion_date,
    dc.tasks_completed,
    SUM(dc.tasks_completed) OVER (ORDER BY dc.completion_date)::BIGINT as cumulative_completed
  FROM daily_completions dc
  ORDER BY dc.completion_date ASC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Archive old completed tasks
-- ============================================================================
CREATE OR REPLACE FUNCTION archive_old_completed_tasks(
  p_project_id UUID,
  p_days_old INTEGER DEFAULT 90
)
RETURNS TABLE (
  archived_count BIGINT
) AS $$
BEGIN
  UPDATE tasks
  SET is_archived = true
  WHERE project_id = p_project_id
  AND status = 'done'
  AND completed_at < CURRENT_TIMESTAMP - (p_days_old || ' days')::INTERVAL
  AND is_archived = false;

  RETURN QUERY
  SELECT COUNT(*)::BIGINT FROM tasks
  WHERE project_id = p_project_id
  AND status = 'done'
  AND is_archived = true
  AND completed_at < CURRENT_TIMESTAMP - (p_days_old || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Duplicate task with all related data
-- ============================================================================
CREATE OR REPLACE FUNCTION duplicate_task(
  p_task_id UUID,
  p_new_title VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_new_task_id UUID;
  v_original_task tasks%ROWTYPE;
BEGIN
  -- Get original task
  SELECT * INTO v_original_task FROM tasks WHERE id = p_task_id;

  IF v_original_task.id IS NULL THEN
    RAISE EXCEPTION 'Task not found';
  END IF;

  -- Create new task
  INSERT INTO tasks (
    title, description, status, priority, project_id,
    assignee_id, created_by, due_date, start_date, tags
  ) VALUES (
    COALESCE(p_new_title, v_original_task.title || ' (Copy)'),
    v_original_task.description,
    'todo',
    v_original_task.priority,
    v_original_task.project_id,
    v_original_task.assignee_id,
    v_original_task.created_by,
    v_original_task.due_date,
    v_original_task.start_date,
    v_original_task.tags
  ) RETURNING id INTO v_new_task_id;

  -- Copy labels
  INSERT INTO task_label_mapping (task_id, label_id)
  SELECT v_new_task_id, label_id
  FROM task_label_mapping
  WHERE task_id = p_task_id;

  -- Copy subtasks
  INSERT INTO task_subtasks (parent_task_id, title, is_completed)
  SELECT v_new_task_id, title, false
  FROM task_subtasks
  WHERE parent_task_id = p_task_id;

  RETURN v_new_task_id;
END;
$$ LANGUAGE plpgsql;
