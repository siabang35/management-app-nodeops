# Setup Guide

## Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

## Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd nodeops-management-app
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Setup environment variables**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your Supabase credentials:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://oizxsktwayfiqaszupev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
\`\`\`

4. **Run development server**
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## Database Setup

1. Create tables in Supabase:
   - tasks
   - projects
   - team_members
   - reports
   - activities
   - shares

2. Enable Row Level Security (RLS) for data protection

3. Setup real-time subscriptions for live updates

## Docker Deployment

\`\`\`bash
docker-compose up -d
\`\`\`

Access the app at `http://localhost:3000`

## Production Deployment

1. Build the application:
\`\`\`bash
npm run build
\`\`\`

2. Deploy to Vercel:
\`\`\`bash
vercel deploy
\`\`\`

Or use Docker for self-hosted deployment.
