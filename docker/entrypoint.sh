#!/bin/sh

set -e

echo "Starting NodeOps Application..."

# Wait for backend to be ready
echo "Waiting for backend service..."
while ! nc -z backend 3001; do
  sleep 1
done
echo "Backend is ready!"

# Start frontend
echo "Starting frontend..."
npm start &
FRONTEND_PID=$!

# Start backend
echo "Starting backend..."
cd backend
npm run prod &
BACKEND_PID=$!

# Wait for both processes
wait $FRONTEND_PID $BACKEND_PID
