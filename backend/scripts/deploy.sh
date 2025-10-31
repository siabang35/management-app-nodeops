#!/bin/bash

set -e

echo "NodeOps Deployment Script"
echo "========================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}Prerequisites OK${NC}"

# Build images
echo -e "${YELLOW}Building Docker images...${NC}"
docker-compose build

# Start services
echo -e "${YELLOW}Starting services...${NC}"
docker-compose up -d

# Wait for services to be ready
echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 10

# Check health
echo -e "${YELLOW}Checking service health...${NC}"

FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
BACKEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/health || echo "000")

if [ "$FRONTEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}Frontend is healthy${NC}"
else
    echo -e "${RED}Frontend health check failed (HTTP $FRONTEND_HEALTH)${NC}"
fi

if [ "$BACKEND_HEALTH" = "200" ]; then
    echo -e "${GREEN}Backend is healthy${NC}"
else
    echo -e "${RED}Backend health check failed (HTTP $BACKEND_HEALTH)${NC}"
fi

echo -e "${GREEN}Deployment complete!${NC}"
echo ""
echo "Access the application:"
echo "  Frontend: http://localhost:3000"
echo "  Backend: http://localhost:3001"
echo ""
echo "View logs: docker-compose logs -f"
echo "Stop services: docker-compose down"
