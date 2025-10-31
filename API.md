# API Documentation

## Base URL
\`\`\`
http://localhost:3001/api
\`\`\`

## Endpoints

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create new task
- `GET /tasks/:id` - Get task details
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `GET /tasks/search?q=query` - Search tasks

### Team
- `GET /team` - Get all team members
- `POST /team` - Add team member
- `PUT /team/:id` - Update team member
- `DELETE /team/:id` - Remove team member
- `GET /team/stats` - Get team statistics

### Reports
- `GET /reports` - Get all reports
- `POST /reports` - Generate new report
- `GET /reports/:id` - Get report details
- `DELETE /reports/:id` - Delete report
- `GET /reports/export/:id` - Export report as PDF

### Analytics
- `GET /analytics/revenue` - Revenue analytics
- `GET /analytics/tasks` - Task analytics
- `GET /analytics/team` - Team analytics
- `GET /analytics/metrics` - Overall metrics
