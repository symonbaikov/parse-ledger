.PHONY: help setup start stop restart logs clean test build migrate admin

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_DEV = docker-compose -f docker-compose.yml -f docker-compose.dev.yml
DOCKER_EXEC_BACKEND = docker exec -it finflow-backend
DOCKER_EXEC_FRONTEND = docker exec -it finflow-frontend
DOCKER_EXEC_DB = docker exec -it finflow-postgres

##@ General

help: ## Display this help message
	@awk 'BEGIN {FS = ":.*##"; printf "\n\033[1m\033[36mUsage:\033[0m\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Setup

setup: ## Initial setup - copy env files and generate secrets
	@echo "🚀 Setting up FinFlow..."
	@bash scripts/generate-env.sh
	@echo "✅ Setup complete!"

install: ## Install dependencies (local development)
	@echo "📦 Installing dependencies..."
	@cd backend && npm install
	@cd frontend && npm install
	@echo "✅ Dependencies installed!"

##@ Docker Operations

start: ## Start all services in production mode
	@echo "🐳 Starting FinFlow (production mode)..."
	@$(DOCKER_COMPOSE) up -d --build
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "✅ FinFlow is running!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:3001/api/v1"
	@echo "Swagger:  http://localhost:3001/api/docs"

dev: ## Start all services in development mode (with hot reload)
	@echo "🐳 Starting FinFlow (development mode)..."
	@$(DOCKER_COMPOSE_DEV) up -d --build
	@echo "⏳ Waiting for services to be ready..."
	@sleep 10
	@echo "✅ FinFlow is running in development mode!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend:  http://localhost:3001/api/v1"
	@echo "Swagger:  http://localhost:3001/api/docs"

stop: ## Stop all services
	@echo "🛑 Stopping FinFlow..."
	@$(DOCKER_COMPOSE) down
	@echo "✅ Services stopped!"

restart: ## Restart all services
	@echo "🔄 Restarting FinFlow..."
	@$(DOCKER_COMPOSE) restart
	@echo "✅ Services restarted!"

clean: ## Stop services and remove volumes
	@echo "🧹 Cleaning up FinFlow..."
	@$(DOCKER_COMPOSE) down -v
	@echo "✅ Cleanup complete!"

##@ Logs

logs: ## View logs from all services
	@$(DOCKER_COMPOSE) logs -f

logs-backend: ## View backend logs
	@$(DOCKER_COMPOSE) logs -f backend

logs-frontend: ## View frontend logs
	@$(DOCKER_COMPOSE) logs -f frontend

logs-db: ## View database logs
	@$(DOCKER_COMPOSE) logs -f postgres

logs-redis: ## View Redis logs
	@$(DOCKER_COMPOSE) logs -f redis

##@ Development (Local)

backend-dev: ## Start backend in development mode (local)
	@echo "🚀 Starting backend in dev mode..."
	@cd backend && npm run start:dev

frontend-dev: ## Start frontend in development mode (local)
	@echo "🚀 Starting frontend in dev mode..."
	@cd frontend && npm run dev

storybook: ## Start Storybook development server
	@echo "📚 Starting Storybook..."
	@cd frontend && npm run storybook
	@echo "✅ Storybook is running at http://localhost:6006"

storybook-build: ## Build Storybook for production
	@echo "🏗️  Building Storybook..."
	@cd frontend && npm run storybook:build
	@echo "✅ Storybook built successfully!"
	@echo "📁 Output: frontend/storybook-static/"

db-start: ## Start only PostgreSQL and Redis
	@echo "🐘 Starting database services..."
	@$(DOCKER_COMPOSE) up -d postgres redis
	@echo "✅ Database services started!"

##@ Database

migrate: ## Run database migrations
	@echo "🔄 Running migrations..."
	@$(DOCKER_EXEC_BACKEND) npm run migration:run
	@echo "✅ Migrations complete!"

migrate-revert: ## Revert last migration
	@echo "⏪ Reverting last migration..."
	@$(DOCKER_EXEC_BACKEND) npm run migration:revert
	@echo "✅ Migration reverted!"

migrate-generate: ## Generate a new migration (usage: make migrate-generate name=MigrationName)
	@if [ -z "$(name)" ]; then \
		echo "❌ Error: Migration name required. Usage: make migrate-generate name=MigrationName"; \
		exit 1; \
	fi
	@echo "📝 Generating migration: $(name)..."
	@$(DOCKER_EXEC_BACKEND) npm run migration:generate -- $(name)
	@echo "✅ Migration generated!"

db-shell: ## Open PostgreSQL shell
	@echo "🐘 Opening database shell..."
	@$(DOCKER_EXEC_DB) psql -U finflow -d finflow

db-backup: ## Backup database
	@echo "💾 Creating database backup..."
	@$(DOCKER_EXEC_DB) pg_dump -U finflow finflow > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup created!"

db-restore: ## Restore database (usage: make db-restore file=backup.sql)
	@if [ -z "$(file)" ]; then \
		echo "❌ Error: Backup file required. Usage: make db-restore file=backup.sql"; \
		exit 1; \
	fi
	@echo "📥 Restoring database from $(file)..."
	@cat $(file) | $(DOCKER_EXEC_DB) psql -U finflow finflow
	@echo "✅ Database restored!"

##@ User Management

admin: ## Create admin user (usage: make admin email=admin@example.com password=admin123 name="Admin")
	@if [ -z "$(email)" ] || [ -z "$(password)" ] || [ -z "$(name)" ]; then \
		echo "❌ Error: All parameters required."; \
		echo "Usage: make admin email=admin@example.com password=admin123 name=\"Admin User\""; \
		exit 1; \
	fi
	@echo "👤 Creating admin user..."
	@$(DOCKER_EXEC_BACKEND) npm run create-admin -- $(email) $(password) "$(name)"
	@echo "✅ Admin user created!"

##@ Testing

test: ## Run all tests
	@echo "🧪 Running tests..."
	@cd backend && npm test
	@cd frontend && npm test
	@echo "✅ Tests complete!"

test-backend: ## Run backend tests
	@echo "🧪 Running backend tests..."
	@cd backend && npm test

test-frontend: ## Run frontend tests
	@echo "🧪 Running frontend tests..."
	@cd frontend && npm test

test-watch: ## Run backend tests in watch mode
	@echo "🧪 Running tests in watch mode..."
	@cd backend && npm run test:watch

test-cov: ## Run tests with coverage
	@echo "🧪 Running tests with coverage..."
	@cd backend && npm run test:cov
	@echo "📊 Coverage report: backend/coverage/lcov-report/index.html"

test-e2e: ## Run end-to-end tests
	@echo "🧪 Running E2E tests..."
	@cd backend && npm run test:e2e

##@ Code Quality

lint: ## Lint and fix code
	@echo "🔍 Linting code (Biome)..."
	@cd backend && npm run lint
	@cd frontend && npm run lint
	@echo "✅ Linting complete!"

lint-check: ## Check linting without fixing
	@echo "🔍 Checking linting (Biome)..."
	@cd backend && npm run lint:check
	@cd frontend && npm run lint:check
	@echo "✅ Linting check complete!"

format: ## Format code with Biome
	@echo "✨ Formatting code..."
	@cd backend && npm run format
	@cd frontend && npm run format
	@echo "✅ Formatting complete!"

type-check: ## Run TypeScript type checking
	@echo "🔍 Type checking..."
	@cd backend && npm run build
	@cd frontend && npm run type-check || echo "No type-check script"
	@echo "✅ Type checking complete!"

##@ Build

build: ## Build for production
	@echo "🏗️  Building FinFlow..."
	@cd backend && npm run build
	@cd frontend && npm run build
	@echo "✅ Build complete!"

build-docker: ## Build Docker images
	@echo "🐳 Building Docker images..."
	@$(DOCKER_COMPOSE) build
	@echo "✅ Docker images built!"

##@ Monitoring

observability: ## Start Prometheus and Grafana
	@echo "📊 Starting observability stack..."
	@docker-compose -f docker-compose.observability.yml up -d
	@echo "✅ Observability stack started!"
	@echo "Prometheus: http://localhost:9090"
	@echo "Grafana:    http://localhost:3002 (admin/admin)"

observability-stop: ## Stop Prometheus and Grafana
	@echo "🛑 Stopping observability stack..."
	@docker-compose -f docker-compose.observability.yml down
	@echo "✅ Observability stack stopped!"

##@ Utilities

shell-backend: ## Open shell in backend container
	@$(DOCKER_EXEC_BACKEND) bash

shell-frontend: ## Open shell in frontend container
	@$(DOCKER_EXEC_FRONTEND) sh

shell-db: ## Open shell in database container
	@$(DOCKER_EXEC_DB) bash

health: ## Check health of all services
	@echo "🏥 Checking service health..."
	@echo "\n📡 Backend:"
	@curl -s http://localhost:3001/api/v1/health || echo "❌ Backend not responding"
	@echo "\n🌐 Frontend:"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "❌ Frontend not responding"
	@echo "\n🐘 PostgreSQL:"
	@$(DOCKER_EXEC_DB) pg_isready -U finflow || echo "❌ PostgreSQL not ready"
	@echo "\n🔴 Redis:"
	@docker exec finflow-redis redis-cli ping || echo "❌ Redis not responding"
	@echo ""

ps: ## Show running containers
	@$(DOCKER_COMPOSE) ps

stats: ## Show container resource usage
	@docker stats --no-stream finflow-backend finflow-frontend finflow-postgres finflow-redis

##@ Documentation

docs: ## Open API documentation
	@echo "📚 Opening Swagger documentation..."
	@open http://localhost:3001/api/docs || xdg-open http://localhost:3001/api/docs || echo "Open http://localhost:3001/api/docs"

storybook-serve: ## Serve Storybook from CI artifacts
	@echo "📚 Serving Storybook from CI artifacts..."
	@./scripts/storybook-serve.sh

storybook-download: ## Download Storybook from CI
	@echo "📥 Downloading Storybook from CI..."
	@./scripts/storybook-download.sh

##@ Quick Actions

quick-start: setup start admin ## Complete setup and start (interactive)
	@echo ""
	@echo "🎉 FinFlow is ready!"
	@echo ""
	@echo "📱 Access the application:"
	@echo "   Frontend: http://localhost:3000"
	@echo "   Backend:  http://localhost:3001/api/v1"
	@echo "   Swagger:  http://localhost:3001/api/docs"
	@echo ""
	@echo "📖 Next steps:"
	@echo "   - View logs:        make logs"
	@echo "   - Stop services:    make stop"
	@echo "   - Run tests:        make test"
	@echo "   - View all commands: make help"
	@echo ""

update: ## Update dependencies
	@echo "📦 Updating dependencies..."
	@cd backend && npm update
	@cd frontend && npm update
	@echo "✅ Dependencies updated!"

reset: clean setup start ## Complete reset - clean, setup, and start
	@echo "✅ FinFlow has been reset!"
