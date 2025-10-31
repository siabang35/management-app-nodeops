-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_label_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_custom_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE views ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can view other users in their projects
CREATE POLICY "Users can view project members" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members pm1
      WHERE pm1.user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM project_members pm2
        WHERE pm2.user_id = users.id
        AND pm2.project_id = pm1.project_id
      )
    )
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================================
-- PROJECTS TABLE POLICIES
-- ============================================================================

-- Users can view projects they own or are members of
CREATE POLICY "Users can view accessible projects" ON projects
  FOR SELECT USING (
    owner_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id
      AND user_id = auth.uid()
    )
  );

-- Only project owners can update projects
CREATE POLICY "Only owners can update projects" ON projects
  FOR UPDATE USING (owner_id = auth.uid());

-- Only project owners can delete projects
CREATE POLICY "Only owners can delete projects" ON projects
  FOR DELETE USING (owner_id = auth.uid());

-- Users can create projects
CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (owner_id = auth.uid());

-- ============================================================================
-- PROJECT MEMBERS TABLE POLICIES
-- ============================================================================

-- Users can view project members of their projects
CREATE POLICY "Users can view project members" ON project_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members pm
      WHERE pm.project_id = project_members.project_id
      AND pm.user_id = auth.uid()
    )
  );

-- Project owners can manage members
CREATE POLICY "Owners can manage project members" ON project_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_members.project_id
      AND projects.owner_id = auth.uid()
    )
  );

-- ============================================================================
-- TASKS TABLE POLICIES
-- ============================================================================

-- Users can view tasks in their projects
CREATE POLICY "Users can view project tasks" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = tasks.project_id
      AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = tasks.project_id
      AND owner_id = auth.uid()
    )
  );

-- Users can create tasks in their projects
CREATE POLICY "Users can create tasks" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = tasks.project_id
      AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = tasks.project_id
      AND owner_id = auth.uid()
    )
  );

-- Users can update tasks they created or are assigned to
CREATE POLICY "Users can update accessible tasks" ON tasks
  FOR UPDATE USING (
    created_by = auth.uid()
    OR assignee_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = tasks.project_id
      AND owner_id = auth.uid()
    )
  );

-- Users can delete tasks they created
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (created_by = auth.uid());

-- ============================================================================
-- TASK COMMENTS TABLE POLICIES
-- ============================================================================

-- Users can view comments on tasks they can access
CREATE POLICY "Users can view task comments" ON task_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE id = task_comments.task_id
      AND (
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = tasks.project_id
          AND user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM projects
          WHERE id = tasks.project_id
          AND owner_id = auth.uid()
        )
      )
    )
  );

-- Users can create comments on accessible tasks
CREATE POLICY "Users can create task comments" ON task_comments
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tasks
      WHERE id = task_comments.task_id
      AND (
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = tasks.project_id
          AND user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM projects
          WHERE id = tasks.project_id
          AND owner_id = auth.uid()
        )
      )
    )
  );

-- Users can update their own comments
CREATE POLICY "Users can update own comments" ON task_comments
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments" ON task_comments
  FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- TASK ATTACHMENTS TABLE POLICIES
-- ============================================================================

-- Users can view attachments on accessible tasks
CREATE POLICY "Users can view task attachments" ON task_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks
      WHERE id = task_attachments.task_id
      AND (
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = tasks.project_id
          AND user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM projects
          WHERE id = tasks.project_id
          AND owner_id = auth.uid()
        )
      )
    )
  );

-- Users can upload attachments to accessible tasks
CREATE POLICY "Users can upload attachments" ON task_attachments
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM tasks
      WHERE id = task_attachments.task_id
      AND (
        EXISTS (
          SELECT 1 FROM project_members
          WHERE project_id = tasks.project_id
          AND user_id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM projects
          WHERE id = tasks.project_id
          AND owner_id = auth.uid()
        )
      )
    )
  );

-- ============================================================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================================================

-- Users can only view their own notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- REPORTS TABLE POLICIES
-- ============================================================================

-- Users can view reports from their projects
CREATE POLICY "Users can view project reports" ON reports
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = reports.project_id
      AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = reports.project_id
      AND owner_id = auth.uid()
    )
  );

-- Users can create reports in their projects
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM project_members
        WHERE project_id = reports.project_id
        AND user_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM projects
        WHERE id = reports.project_id
        AND owner_id = auth.uid()
      )
    )
  );

-- ============================================================================
-- ACTIVITY LOGS TABLE POLICIES
-- ============================================================================

-- Users can view activity logs from their projects
CREATE POLICY "Users can view project activity" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = activity_logs.project_id
      AND user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM projects
      WHERE id = activity_logs.project_id
      AND owner_id = auth.uid()
    )
  );

-- System can insert activity logs
CREATE POLICY "System can insert activity logs" ON activity_logs
  FOR INSERT WITH CHECK (true);
