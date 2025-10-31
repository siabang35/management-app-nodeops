#!/bin/bash

# Setup environment variables for Supabase connection

echo "NodeOps Project Management - Environment Setup"
echo "=============================================="
echo ""

# Check if .env exists
if [ -f .env ]; then
  echo "✓ .env file found"
  
  # Check if required variables are set
  if grep -q "SUPABASE_URL=" .env && grep -q "SUPABASE_SERVICE_KEY=" .env; then
    echo "✓ Supabase environment variables are configured"
    
    # Display current values (masked)
    SUPABASE_URL=$(grep "SUPABASE_URL=" .env | cut -d '=' -f 2)
    echo "  - SUPABASE_URL: ${SUPABASE_URL:0:20}..."
    echo ""
    echo "Ready to run: ./scripts/schema.sh"
  else
    echo "✗ Missing Supabase environment variables"
    echo ""
    echo "Please add the following to your .env file:"
    echo "  SUPABASE_URL=https://your-project.supabase.co"
    echo "  SUPABASE_SERVICE_KEY=your_service_key_here"
  fi
else
  echo "✗ .env file not found"
  echo ""
  echo "Creating .env file from template..."
  
  cat > .env << 'EOF'
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_key_here

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRATION=7d
EOF
  
  echo "✓ .env file created"
  echo ""
  echo "Please update the following values in .env:"
  echo "  - SUPABASE_URL"
  echo "  - SUPABASE_ANON_KEY"
  echo "  - SUPABASE_SERVICE_KEY"
  echo "  - JWT_SECRET"
fi
