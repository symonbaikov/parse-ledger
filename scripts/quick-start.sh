#!/bin/bash

# FinFlow Quick Start Script
# Automated setup for FinFlow - get up and running in under 2 minutes!

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Emojis
ROCKET="🚀"
CHECK="✅"
WARN="⚠️ "
ERROR="❌"
CLOCK="⏱️ "
PACKAGE="📦"
KEY="🔑"
DATABASE="🐘"
REDIS_ICON="🔴"
GEAR="⚙️ "
SPARKLES="✨"
TADA="🎉"

echo ""
echo -e "${CYAN}${ROCKET} FinFlow - Quick Start Setup${NC}"
echo -e "${CYAN}================================${NC}"
echo ""

# Check if Docker is installed and running
echo -e "${BLUE}${GEAR} Checking prerequisites...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}${ERROR} Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/get-started"
    exit 1
fi

if ! docker info &> /dev/null; then
    echo -e "${RED}${ERROR} Docker is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}${ERROR} Docker Compose is not installed${NC}"
    echo "Please install Docker Compose"
    exit 1
fi

echo -e "${GREEN}${CHECK} Docker is installed and running${NC}"
echo ""

# Copy environment files
echo -e "${BLUE}${GEAR} Setting up environment files...${NC}"

# Root .env
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "${GREEN}${CHECK} Created .env${NC}"
    else
        echo -e "${YELLOW}${WARN} .env.example not found, skipping root .env${NC}"
    fi
else
    echo -e "${YELLOW}${WARN} .env already exists, skipping${NC}"
fi

# Backend .env
if [ ! -f "backend/.env" ]; then
    if [ -f "backend/.env.example" ]; then
        cp backend/.env.example backend/.env
        echo -e "${GREEN}${CHECK} Created backend/.env${NC}"
    else
        echo -e "${RED}${ERROR} backend/.env.example not found${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}${WARN} backend/.env already exists, skipping${NC}"
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    if [ -f "frontend/.env.local.example" ]; then
        cp frontend/.env.local.example frontend/.env.local
        echo -e "${GREEN}${CHECK} Created frontend/.env.local${NC}"
    else
        echo -e "${YELLOW}${WARN} frontend/.env.local.example not found, creating basic config${NC}"
        cat > frontend/.env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_ENV=development
EOF
        echo -e "${GREEN}${CHECK} Created frontend/.env.local${NC}"
    fi
else
    echo -e "${YELLOW}${WARN} frontend/.env.local already exists, skipping${NC}"
fi

echo ""

# Generate JWT secrets
echo -e "${BLUE}${KEY} Generating secure JWT secrets...${NC}"

if command -v openssl &> /dev/null; then
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -d '\n')
    
    # Update backend/.env with generated secrets
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" backend/.env
        sed -i '' "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}|g" backend/.env
    else
        # Linux
        sed -i "s|JWT_SECRET=.*|JWT_SECRET=${JWT_SECRET}|g" backend/.env
        sed -i "s|JWT_REFRESH_SECRET=.*|JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}|g" backend/.env
    fi
    
    echo -e "${GREEN}${CHECK} JWT secrets generated and configured${NC}"
else
    echo -e "${YELLOW}${WARN} OpenSSL not found, using default secrets (NOT RECOMMENDED FOR PRODUCTION)${NC}"
    echo -e "${YELLOW}${WARN} Please generate secure secrets manually: openssl rand -base64 32${NC}"
fi

echo ""

# Start Docker containers
echo -e "${BLUE}${ROCKET} Starting Docker containers...${NC}"
echo -e "${CYAN}This may take a few minutes on first run...${NC}"
echo ""

docker-compose up -d --build

echo ""
echo -e "${BLUE}${CLOCK} Waiting for services to be ready...${NC}"

# Wait for PostgreSQL
echo -n "Waiting for PostgreSQL..."
for i in {1..30}; do
    if docker exec finflow-postgres pg_isready -U finflow &> /dev/null; then
        echo -e " ${GREEN}${CHECK}${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

# Wait for Redis
echo -n "Waiting for Redis..."
for i in {1..20}; do
    if docker exec finflow-redis redis-cli ping &> /dev/null 2>&1; then
        echo -e " ${GREEN}${CHECK}${NC}"
        break
    fi
    echo -n "."
    sleep 1
done

# Wait for Backend
echo -n "Waiting for Backend API..."
for i in {1..40}; do
    if curl -s http://localhost:3001/api/v1/health &> /dev/null; then
        echo -e " ${GREEN}${CHECK}${NC}"
        break
    fi
    echo -n "."
    sleep 3
done

# Wait for Frontend
echo -n "Waiting for Frontend..."
for i in {1..30}; do
    if curl -s -o /dev/null http://localhost:3000; then
        echo -e " ${GREEN}${CHECK}${NC}"
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
echo -e "${GREEN}${CHECK} All services are ready!${NC}"
echo ""

# Create admin user
echo -e "${BLUE}${GEAR} Admin User Setup${NC}"
echo -e "${CYAN}Create your first admin user to access FinFlow${NC}"
echo ""

read -p "Enter admin email: " ADMIN_EMAIL
while [[ ! "$ADMIN_EMAIL" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; do
    echo -e "${RED}${ERROR} Invalid email format${NC}"
    read -p "Enter admin email: " ADMIN_EMAIL
done

read -sp "Enter admin password: " ADMIN_PASSWORD
echo ""
while [ ${#ADMIN_PASSWORD} -lt 6 ]; do
    echo -e "${RED}${ERROR} Password must be at least 6 characters${NC}"
    read -sp "Enter admin password: " ADMIN_PASSWORD
    echo ""
done

read -p "Enter admin name: " ADMIN_NAME
while [ -z "$ADMIN_NAME" ]; do
    echo -e "${RED}${ERROR} Name cannot be empty${NC}"
    read -p "Enter admin name: " ADMIN_NAME
done

echo ""
echo -e "${BLUE}Creating admin user...${NC}"

if docker exec finflow-backend npm run create-admin -- "$ADMIN_EMAIL" "$ADMIN_PASSWORD" "$ADMIN_NAME" &> /dev/null; then
    echo -e "${GREEN}${CHECK} Admin user created successfully!${NC}"
else
    echo -e "${YELLOW}${WARN} Could not create admin user automatically${NC}"
    echo -e "${CYAN}You can create it manually later with:${NC}"
    echo -e "${CYAN}docker exec -it finflow-backend npm run create-admin -- <email> <password> <name>${NC}"
fi

echo ""
echo -e "${GREEN}${SPARKLES}${TADA} FinFlow is ready! ${TADA}${SPARKLES}${NC}"
echo ""
echo -e "${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║           Access your FinFlow instance:               ║${NC}"
echo -e "${CYAN}╠════════════════════════════════════════════════════════╣${NC}"
echo -e "${CYAN}║                                                        ║${NC}"
echo -e "${CYAN}║  🌐  Frontend:  ${GREEN}http://localhost:3000${CYAN}                 ║${NC}"
echo -e "${CYAN}║  🔧  Backend:   ${GREEN}http://localhost:3001/api/v1${CYAN}          ║${NC}"
echo -e "${CYAN}║  📚  API Docs:  ${GREEN}http://localhost:3001/api/docs${CYAN}        ║${NC}"
echo -e "${CYAN}║                                                        ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📖 Quick Commands:${NC}"
echo -e "  ${CYAN}View logs:${NC}        docker-compose logs -f"
echo -e "  ${CYAN}Stop services:${NC}    docker-compose down"
echo -e "  ${CYAN}Restart:${NC}          docker-compose restart"
echo -e "  ${CYAN}Make commands:${NC}    make help"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo -e "  ${CYAN}README:${NC}           cat README.md"
echo -e "  ${CYAN}Contributing:${NC}     cat CONTRIBUTING.md"
echo -e "  ${CYAN}Docker Setup:${NC}     cat DOCKER.md"
echo ""
echo -e "${GREEN}Happy banking! 💰${NC}"
echo ""
