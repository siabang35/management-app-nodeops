# NodeOps Deployment Guide

## Prerequisites

- Docker & Docker Compose installed
- Node.js 20+ (for local development)
- Supabase account with credentials

## Local Development

### Setup

1. Clone the repository
2. Copy `.env.example` to `.env.local` and fill in your credentials
3. Install dependencies:

\`\`\`bash
npm install
cd backend && npm install && cd ..
\`\`\`

4. Start development servers:

\`\`\`bash
npm run dev
# In another terminal
cd backend && npm run dev
\`\`\`

### Access

- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Docker Deployment

### Build Images

\`\`\`bash
# Build all services
docker-compose build

# Build specific service
docker-compose build frontend
docker-compose build backend
\`\`\`

### Run Services

\`\`\`bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
\`\`\`

### Environment Variables

Create `.env` file in root directory:

\`\`\`
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
\`\`\`

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (1.20+)
- kubectl configured
- Docker images pushed to registry

### Deploy

\`\`\`bash
# Create namespace
kubectl create namespace nodeops

# Create secrets
kubectl create secret generic nodeops-secrets \
  --from-literal=supabase-url=your_url \
  --from-literal=supabase-anon-key=your_key \
  -n nodeops

# Deploy
kubectl apply -f kubernetes/deployment.yaml -n nodeops

# Check status
kubectl get pods -n nodeops
kubectl get svc -n nodeops
\`\`\`

### Access

\`\`\`bash
# Port forward
kubectl port-forward svc/nodeops-frontend 3000:80 -n nodeops
kubectl port-forward svc/nodeops-backend 3001:3001 -n nodeops
\`\`\`

## Production Checklist

- [ ] Environment variables configured
- [ ] SSL certificates generated
- [ ] Database backups configured
- [ ] Monitoring setup
- [ ] Logging configured
- [ ] Health checks verified
- [ ] Load balancing configured
- [ ] Auto-scaling policies set

## Troubleshooting

### Container won't start

\`\`\`bash
docker-compose logs backend
docker-compose logs frontend
\`\`\`

### Connection issues

\`\`\`bash
# Check network
docker network ls
docker network inspect nodeops-network

# Test connectivity
docker-compose exec backend ping frontend
\`\`\`

### Performance issues

- Check resource limits in docker-compose.yml
- Monitor with: `docker stats`
- Scale services: `docker-compose up -d --scale backend=3`

## Monitoring

### Health Checks

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/health

### Logs

\`\`\`bash
docker-compose logs -f --tail=100
\`\`\`

### Metrics

Use Prometheus + Grafana for detailed monitoring.
