# Build stage for frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Build stage for backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm ci

COPY backend . .

RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy frontend build
COPY --from=frontend-builder /app/.next ./.next
COPY --from=frontend-builder /app/public ./public
COPY --from=frontend-builder /app/package*.json ./

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/package*.json ./backend/

# Install production dependencies
RUN npm ci --only=production && \
    cd backend && npm ci --only=production && cd ..

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeops -u 1001

USER nodeops

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start both frontend and backend
CMD ["sh", "-c", "npm start & cd backend && npm run prod"]
