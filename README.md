# FinFlow

FinFlow is a web app for importing and processing bank statements, organizing financial data, and sharing it inside a workspace.

## Highlights

- Bank statement import and parsing
- Custom tables and data entry
- Google Sheets integration
- Workspace invites with roles and granular permissions
- Telegram reporting
- Built-in API docs (Swagger)

## Tech Stack

**Backend**
- Node.js, NestJS
- PostgreSQL, TypeORM
- Redis (background/queues where applicable)
- Swagger (`/api/docs`)

**Frontend**
- Next.js (App Router), React, TypeScript
- Tailwind CSS + shadcn-style UI primitives (plus some MUI screens)
- Axios
- i18n via Intlayer

## Repository Structure

```
parse-ledger/
├── backend/                 # NestJS API
├── frontend/                # Next.js app
├── docs/                    # Project docs
├── observability/           # Prometheus/Grafana configs
├── scripts/                 # Helper scripts
├── docker-compose.yml
├── docker-compose.dev.yml
└── docker-compose.observability.yml
```

## Quick Start

### Option A — Docker (recommended)

```bash
cp .env.example .env

docker-compose up -d --build
```

**URLs**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api/v1`
- Swagger: `http://localhost:3001/api/docs`

### Option B — Local development

1) Start infra:
```bash
docker-compose up -d postgres redis
```

2) Configure env:
```bash
cd backend && cp .env.example .env
cd ../frontend && cp .env.local.example .env.local
```

3) Install and run:
```bash
npm install
npm run backend:dev
```

In a second terminal:
```bash
npm run frontend:dev
```

## Environment Variables (minimum)

**Backend** (`backend/.env`)
- `DATABASE_URL`
- `JWT_SECRET` (32+ chars recommended)
- `JWT_REFRESH_SECRET` (32+ chars recommended)

**Frontend** (`frontend/.env.local`)
- `NEXT_PUBLIC_API_URL` (example: `http://localhost:3001/api/v1`)

Generate secrets:
```bash
openssl rand -base64 32
```

## Create an Admin User

```bash
npm run create-admin -- admin@example.com admin123 "Admin User"
```

If running via Docker:
```bash
docker exec -it finflow-backend npm run create-admin -- admin@example.com admin123 "Admin User"
```

## Observability (Prometheus + Grafana)

```bash
docker-compose -f docker-compose.observability.yml up -d
```

Provisioning lives in `observability/` (datasources, dashboards, Prometheus config).

## Useful Commands

```bash
npm run backend:build
npm run backend:dev

npm run frontend:build
npm run frontend:dev

npm run migration:run
```

## Documentation

- `docs/requirements.md`
- `docs/plan.md`
- `docs/arch-rules.md`
- `docs/api.md`
- `DOCKER.md`
- `RAILWAY.md`

## License

TBD

Private project
