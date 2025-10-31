-- ============================================================================
-- TRIGGER FUNCTIONS AND TRIGGERS
-- ============================================================================

-- ============================================================================
-- Update updated_at timestamp function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update_updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON task_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_subtasks_updated_at BEFORE UPDATE ON task_subtasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_fields_updated_at BEFORE UPDATE ON custom_fields
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_task_custom_field_values_updated_at BEFORE UPDATE ON task_custom_field_values
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_views_updated_at BEFORE UPDATE ON views
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Log activity function
-- ============================================================================
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_project_id UUID;
  v_user_id UUID;
  v_action VARCHAR;
  v_entity_type VARCHAR;
  v_changes JSONB;
BEGIN
  -- Determine action type
  IF TG_OP = 'INSERT' THEN
    v_action := 'created';
    v_changes := row_to_json(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'updated';
    v_changes := jsonb_build_object(
      'old', row_to_json(OLD),
      'new', row_to_json(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'deleted';
    v_changes := row_to_json(OLD);
  END IF;

  -- Determine entity type and project_id
  IF TG_TABLE_NAME = 'tasks' THEN
    v_entity_type := 'task';
    v_project_id := COALESCE(NEW.project_id, OLD.project_id);
    v_user_id := COALESCE(NEW.created_by, OLD.created_by);
  ELSIF TG_TABLE_NAME = 'projects' THEN
    v_entity_type := 'project';
    v_project_id := COALESCE(NEW.id, OLD.id);
    v_user_id := COALESCE(NEW.owner_id, OLD.owner_id);
  ELSIF TG_TABLE_NAME = 'team_members' THEN
    v_entity_type := 'team_member';
    v_project_id := COALESCE(NEW.project_id, OLD.project_id);
    v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  ELSIF TG_TABLE_NAME = 'reports' THEN
    v_entity_type := 'report';
    v_project_id := COALESCE(NEW.project_id, OLD.project_id);
    v_user_id := COALESCE(NEW.created_by, OLD.created_by);
  END IF;

  -- Insert activity log
  IF v_project_id IS NOT NULL AND v_user_id IS NOT NULL THEN
    INSERT INTO activity_logs (project_id, user_id, action, entity_type, entity_id, changes)
    VALUES (
      v_project_id,
      v_user_id,
      v_action,
      v_entity_type,
      COALESCE(NEW.id, OLD.id),
      v_changes
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply activity logging triggers
CREATE TRIGGER log_task_activity AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_project_activity AFTER INSERT OR UPDATE OR DELETE ON projects
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_team_member_activity AFTER INSERT OR UPDATE OR DELETE ON team_members
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_report_activity AFTER INSERT OR UPDATE OR DELETE ON reports
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ============================================================================
-- Task completion notification function
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status != 'done' THEN
    -- Create notification for task creator
    INSERT INTO notifications (user_id, project_id, type, title, message, related_entity_id)
    VALUES (
      NEW.created_by,
      NEW.project_id,
      'task_completed',
      'Task Completed',
      'Task "' || NEW.title || '" has been completed',
      NEW.id
    );

    -- Update completed_at timestamp
    NEW.completed_at := CURRENT_TIMESTAMP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_completion_notification BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_completion();

-- ============================================================================
-- Task assignment notification function
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_task_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.assignee_id IS NOT NULL AND (OLD.assignee_id IS NULL OR NEW.assignee_id != OLD.assignee_id) THEN
    -- Create notification for assignee
    INSERT INTO notifications (user_id, project_id, type, title, message, related_entity_id)
    VALUES (
      NEW.assignee_id,
      NEW.project_id,
      'task_assigned',
      'Task Assigned',
      'You have been assigned to task "' || NEW.title || '"',
      NEW.id
    );

    -- Log assignment
    INSERT INTO task_assignments (task_id, assigned_to, assigned_by)
    VALUES (NEW.id, NEW.assignee_id, auth.uid());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_assignment_notification AFTER UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_task_assignment();

-- ============================================================================
-- Comment notification function
-- ============================================================================
CREATE OR REPLACE FUNCTION notify_task_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_task_title VARCHAR;
  v_project_id UUID;
BEGIN
  -- Get task info
  SELECT title, project_id INTO v_task_title, v_project_id
  FROM tasks WHERE id = NEW.task_id;

  -- Notify task creator
  INSERT INTO notifications (user_id, project_id, type, title, message, related_entity_id)
  SELECT
    tasks.created_by,
    NEW.project_id,
    'task_commented',
    'New Comment',
    'Someone commented on task "' || v_task_title || '"',
    NEW.task_id
  FROM tasks
  WHERE tasks.id = NEW.task_id
  AND tasks.created_by != NEW.user_id;

  -- Notify assignee if different from creator
  INSERT INTO notifications (user_id, project_id, type, title, message, related_entity_id)
  SELECT
    tasks.assignee_id,
    NEW.project_id,
    'task_commented',
    'New Comment',
    'Someone commented on task "' || v_task_title || '"',
    NEW.task_id
  FROM tasks
  WHERE tasks.id = NEW.task_id
  AND tasks.assignee_id IS NOT NULL
  AND tasks.assignee_id != NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER task_comment_notification AFTER INSERT ON task_comments
  FOR EACH ROW EXECUTE FUNCTION notify_task_comment();

-- ============================================================================
-- Cleanup function for archived projects
-- ============================================================================
CREATE OR REPLACE FUNCTION cleanup_archived_project()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_archived = true AND OLD.is_archived = false THEN
    -- Archive all tasks in the project
    UPDATE tasks SET is_archived = true WHERE project_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleanup_archived_project_trigger AFTER UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION cleanup_archived_project();
