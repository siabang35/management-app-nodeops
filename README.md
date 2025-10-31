# 🚀 NodeOps — Web3 Task Management Dashboard

A **comprehensive and modern task management application** inspired by Notion, built with **Next.js**, **NestJS**, and **Supabase**.  
Perfectly tailored for **Web3 projects**, featuring advanced modules for **task management**, **team collaboration**, **revenue analytics**, and **PDF reporting**.

---

## ✨ Core Features

### 📊 Dashboard
- Real-time metrics & KPIs overview  
- Interactive revenue charts and analytics  
- Kanban-style task board for project tracking  
- Team member and moderator overview  
- Recent activity timeline  

### 🧠 Mindshare Leaderboard
- Top 25 contributors with ranking system  
- User profiles with **Web3 wallet addresses**  
- Integrated social handles (X, Telegram, Discord)  
- Promo code and referral system  
- Real-time score and engagement tracking  

### ✅ Task Management
- Full CRUD operations (Create, Read, Update, Delete)  
- Drag-and-drop **Kanban workflow**  
- Task filters: status, assignee, priority  
- Task statistics and completion analytics  
- Priority levels: Low, Medium, High  

### 👥 Team Management
- Manage **moderators** and **ambassadors**  
- Profile view with role and contribution data  
- Activity history and engagement metrics  
- Role-based access control (RBAC)  
- Team insights and statistics dashboard  

### 📈 Reports & Analytics
- Revenue and performance reports with breakdowns  
- Task completion and productivity analysis  
- Team performance metrics  
- **PDF export** support for all reports  
- Filterable by custom date ranges  

### ⚙️ Technical Features
- Real-time synchronization with **Supabase**  
- Offline-ready with **local storage integration**  
- Responsive design for all devices  
- Built-in **Dark Mode**  
- Elegant interface with **Tailwind CSS 4**  

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Frontend** | Next.js 15, React 18, Tailwind CSS 4, Lucide React |
| **Backend** | NestJS 10, Supabase (PostgreSQL), PDFKit, Class Validator |
| **DevOps** | Docker, Docker Compose, Kubernetes, Nginx |

---

## 📂 Project Structure

```
nodeops/
├── app/                          # Next.js app directory
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Main dashboard
│   └── globals.css              # Global styles
├── components/
│   ├── layout/                  # Layout components
│   ├── views/                   # Page views
│   ├── dashboard/               # Dashboard widgets
│   ├── modals/                  # Modal dialogs
│   └── ui/                      # Shared UI components
├── hooks/                        # Custom React hooks
├── lib/                          # Utility and helper functions
├── public/                       # Static assets
├── backend/
│   ├── src/
│   │   ├── main.ts             # NestJS entry point
│   │   ├── app.module.ts       # Root module
│   │   └── modules/            # Feature modules (auth, tasks, reports, etc.)
│   ├── Dockerfile              # Backend Docker configuration
│   └── package.json            # Backend dependencies
├── docker/                       # Docker config files
├── kubernetes/                   # Kubernetes manifests
├── scripts/                      # Deployment scripts
├── docker-compose.yml           # Docker Compose setup
└── README.md                    # This file
```

---

## 🚀 Getting Started

### 🧩 Prerequisites
- Node.js 20+  
- Docker & Docker Compose  
- Supabase account and project credentials  

### 🧠 Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/siabang35/management-app-nodeops.git
   cd nodeops
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install && cd ..
   ```

4. **Start development servers**
   ```bash
   # Frontend
   npm run dev

   # Backend
   cd backend && npm run dev
   ```

5. **Access the application**
   - Frontend → http://localhost:3000  
   - Backend → http://localhost:3001  

---

## 🐳 Docker Deployment

1. **Build and start services**
   ```bash
   docker-compose up -d
   ```

2. **Access the application**
   - Frontend → http://localhost:3000  
   - Backend → http://localhost:3001  

3. **Logs and cleanup**
   ```bash
   docker-compose logs -f
   docker-compose down
   ```

---

## 📡 API Endpoints Overview

### 🔐 Authentication
| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/auth/login` | User login |
| POST | `/auth/register` | User registration |
| POST | `/auth/logout` | User logout |

### 🧾 Tasks
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/tasks` | Retrieve all tasks |
| POST | `/tasks` | Create new task |
| GET | `/tasks/:id` | Get specific task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| GET | `/tasks/stats` | Task statistics |

### 👨‍💻 Teams
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/teams` | Retrieve all team members |
| POST | `/teams` | Add new team member |
| GET | `/teams/:id` | Get member details |
| PUT | `/teams/:id` | Update member data |
| DELETE | `/teams/:id` | Remove member |
| GET | `/teams/stats` | Team statistics |

### 📊 Reports
| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/reports/revenue` | Revenue analytics |
| GET | `/reports/revenue/pdf` | Export revenue PDF |
| GET | `/reports/tasks` | Task analytics |
| GET | `/reports/tasks/pdf` | Export task PDF |
| GET | `/reports/team` | Team analytics |
| GET | `/reports/team/pdf` | Export team PDF |
| GET | `/reports/metrics` | General metrics |

---

## ⚙️ Configuration

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend `.env.local`
```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=7d
```

---

## 🧩 Database Schema Overview

| Table | Description |
|--------|-------------|
| `tasks` | Task records and metadata |
| `team_members` | Member profiles and roles |
| `revenue` | Revenue tracking and analytics |
| `reports` | Generated report metadata |

---

## ⚡ Performance Optimization
- Multi-stage Docker builds  
- Nginx compression (Gzip enabled)  
- Optimized caching and SSR rendering  
- Health checks and load balancing  
- Connection pooling for Supabase  

---

## 🔒 Security Practices
- Non-root Docker containers  
- Strict CORS configuration  
- Input validation (Class Validator)  
- Environment isolation per environment  
- SQL injection prevention (ORM layer)  

---

## 📈 Monitoring & Logging
- Health check endpoints  
- Structured backend logging  
- Docker logs and Nginx access logs  
- Error tracking and alerting hooks  

---

## 🚢 Deployment Options

### 🧱 Docker Compose (Recommended for staging)
```bash
docker-compose up -d
```

### ☸️ Kubernetes (For production scale)
```bash
kubectl apply -f kubernetes/deployment.yaml
```

> See [DEPLOYMENT.md](./DEPLOYMENT.md) for advanced setup instructions.

---

## 🤝 Contributing
1. Fork this repository  
2. Create your feature branch  
3. Commit and push your changes  
4. Submit a pull request  

---

## 📜 License
Licensed under the **MIT License** — see `LICENSE` for details.

---

## 💬 Support
For assistance or bug reports:  
- GitHub Issues → [Create an issue](https://github.com/yourusername/nodeops/issues)  
- Email → support@nodeops.io  

---

## 🗺️ Roadmap
- [ ] Real-time notifications  
- [ ] Advanced analytics dashboard  
- [ ] Mobile application (Flutter / React Native)  
- [ ] API rate limiting and caching  
- [ ] Multi-language support  
- [ ] Custom task workflows  
- [ ] External integrations (Slack, Discord)  

---

## 🙏 Acknowledgments
- Built with ❤️ using **Next.js**, **NestJS**, and **Supabase**  
- UI powered by **shadcn/ui**  
- Icons provided by **Lucide React**  
- Styling by **Tailwind CSS 4**  
