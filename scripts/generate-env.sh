#!/bin/bash

# Script to generate .env files with secure JWT secrets

echo "🚀 FinFlow - Environment Setup Script"
echo ""

# Generate JWT secrets
JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -d '\n')

echo "✅ Generated JWT secrets"

# Backend .env
if [ ! -f "backend/.env" ]; then
  echo "📝 Creating backend/.env..."
  cat > backend/.env << EOF
# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
APP_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=postgresql://finflow:finflow@localhost:5432/finflow

# JWT Configuration (auto-generated)
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
JWT_REFRESH_EXPIRES_IN=30d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Google APIs Configuration (optional)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/v1/auth/google/callback

# Telegram Bot Configuration (optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token

# Resend (workspace invitations)
RESEND_API_KEY=
RESEND_FROM="FinFlow <noreply@your-domain.com>"
RESEND_REPLY_TO=

# Logging
LOG_LEVEL=info
EOF
  echo "✅ Created backend/.env"
else
  echo "⚠️  backend/.env already exists, skipping..."
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
  echo "📝 Creating frontend/.env.local..."
  cat > frontend/.env.local << EOF
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Environment
NEXT_PUBLIC_ENV=development
EOF
  echo "✅ Created frontend/.env.local"
else
  echo "⚠️  frontend/.env.local already exists, skipping..."
fi

echo ""
echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start database: docker-compose up -d"
echo "2. Install dependencies: cd backend && npm install && cd ../frontend && npm install"
echo "3. Start backend: cd backend && npm run start:dev"
echo "4. Start frontend: cd frontend && npm run dev"
echo ""







