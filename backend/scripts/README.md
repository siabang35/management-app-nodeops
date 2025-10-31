# NodeOps Project Management - Database Setup

Panduan lengkap untuk setup database Supabase untuk NodeOps Project Management App.

## Prerequisites

Sebelum menjalankan setup, pastikan Anda memiliki:

1. **PostgreSQL** (untuk psql command)
   - Download: https://www.postgresql.org/download/
   - Pastikan psql tersedia di PATH

2. **Supabase Project**
   - Buat project di https://supabase.com
   - Dapatkan SUPABASE_URL dan SUPABASE_SERVICE_KEY

3. **.env File**
   - Copy `.env.example` ke `.env`
   - Update dengan credentials Supabase Anda

## Setup Instructions

### 1. Persiapan Environment

\`\`\`bash
# Linux/Mac
bash scripts/setup-env.sh

# Windows
cmd /c scripts\setup-env.sh
\`\`\`

### 2. Update .env File

Edit file `.env` dan isi dengan credentials Supabase Anda:

\`\`\`env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
\`\`\`

### 3. Jalankan Setup

**Linux/Mac:**
\`\`\`bash
bash scripts/schema.sh
\`\`\`

**Windows:**
\`\`\`bash
cmd /c scripts\schema-windows.bat
\`\`\`

**Atau menggunakan npm:**
\`\`\`bash
npm run setup          # Linux/Mac
npm run setup:windows  # Windows
\`\`\`

## Script Details

### 01-init-schema.sql
Membuat 19 tabel utama:
- users, projects, tasks, team_members
- project_members, task_comments, task_attachments
- task_labels, task_dependencies, custom_fields
- reports, notifications, activity_logs
- dan lainnya

### 02-create-indexes.sql
Membuat 50+ indexes untuk performa optimal:
- Foreign key indexes
- Status dan priority indexes
- Date range indexes
- Full-text search indexes

### 03-enable-rls.sql
Mengaktifkan Row Level Security (RLS):
- Policies untuk users
- Policies untuk projects
- Policies untuk tasks dan comments
- Policies untuk attachments dan notifications

### 04-create-triggers.sql
Membuat triggers untuk automation:
- Auto-update updated_at timestamp
- Activity logging otomatis
- Notifikasi untuk events
- Cleanup untuk archived data

### 05-seed-data.sql
Menambahkan sample data untuk development:
- Sample users
- Sample projects
- Sample tasks dan comments
- Sample team members

### 06-utility-functions.sql
Membuat 8 utility functions:
- get_task_statistics()
- get_team_member_stats()
- search_tasks()
- get_upcoming_tasks()
- get_activity_summary()
- get_completion_trends()
- archive_project()
- duplicate_task()

## Troubleshooting

### Error: psql not found
**Solusi:** Install PostgreSQL dari https://www.postgresql.org/download/

### Error: Connection refused
**Solusi:** 
- Verifikasi SUPABASE_URL dan SUPABASE_SERVICE_KEY di .env
- Pastikan project Supabase aktif

### Error: Permission denied
**Solusi:**
- Pastikan SUPABASE_SERVICE_KEY memiliki akses admin
- Gunakan service key, bukan anon key

### Error: SQL syntax error
**Solusi:**
- Verifikasi SQL files ada di direktori scripts/
- Pastikan menggunakan PostgreSQL 13+

## Verifikasi Setup

Setelah setup berhasil, verifikasi di Supabase Dashboard:

1. Buka https://supabase.com
2. Login ke project Anda
3. Buka "SQL Editor"
4. Jalankan query untuk verifikasi:

\`\`\`sql
-- Lihat semua tabel
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Lihat jumlah records
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks;
\`\`\`

## Next Steps

1. Update backend configuration untuk connect ke Supabase
2. Setup authentication di frontend
3. Jalankan backend server: `npm run start`
4. Jalankan frontend: `npm run dev`

## Support

Jika ada masalah, cek:
- Supabase documentation: https://supabase.com/docs
- PostgreSQL documentation: https://www.postgresql.org/docs/
- Project repository issues

---

**Created:** 2025
**Version:** 1.0.0
