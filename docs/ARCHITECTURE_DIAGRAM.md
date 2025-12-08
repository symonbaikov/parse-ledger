# Unified Deployment Architecture Diagram

## Request Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
│              https://your-railway-domain                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS Request
                         │
        ┌────────────────▼────────────────┐
        │                                  │
        │     Railway Application         │
        │   (port 3001, single process)   │
        │                                  │
        │  ┌───────────────────────────┐  │
        │  │   Express/NestJS Server   │  │
        │  └───────────────────────────┘  │
        │           │                      │
        │           ├─ GET /               │
        │           │  └─► Frontend        │
        │           │      (Next.js SPA)   │
        │           │      index.html      │
        │           │                      │
        │           ├─ GET /api/v1/*       │
        │           │  └─► NestJS Routes   │
        │           │      API Handlers    │
        │           │                      │
        │           ├─ GET /api/docs       │
        │           │  └─► Swagger UI      │
        │           │                      │
        │           ├─ GET /*.js, /*.css  │
        │           │  └─► Static Assets   │
        │           │      (from frontend) │
        │           │                      │
        │           └─ GET /api/v1/health │
        │              └─► Health Check    │
        │                                  │
        │  ┌───────────────────────────┐  │
        │  │   Persistent Storage      │  │
        │  │   - uploads/              │  │
        │  │   - reports/              │  │
        │  └───────────────────────────┘  │
        └────────────────┬────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        │ (TCP Connect)  │                │
        │                │                │
   ┌────▼────┐      ┌────▼────┐   ┌─────▼──────┐
   │PostgreSQL│      │  Redis  │   │ External   │
   │Database  │      │ Cache   │   │ Services   │
   │(finflow) │      │         │   │ (Google,   │
   │          │      │         │   │  Telegram) │
   └──────────┘      └─────────┘   └────────────┘
```

## Build Process

```
┌──────────────────────────────────────────────────────────────┐
│                    Dockerfile Build                           │
└──────────────────────────────────────────────────────────────┘
          │
          ├─ FROM node:20-alpine
          │
          ├─ COPY package*.json .
          │
          ├─ WORKDIR frontend
          │  ├─ npm install --production=false
          │  └─ npm run build
          │     └─► .next/standalone/
          │
          ├─ WORKDIR backend
          │  ├─ npm install --production=false
          │  └─ npm run build
          │     └─► dist/
          │
          ├─ COPY frontend/.next dist/public/
          │
          └─ CMD ["node", "dist/main.js"]
             └─► Single Production Server

Result: 1 Docker Image + 1 Running Container
```

## File Structure in Container

```
/app/backend/
├── dist/                          ← Compiled NestJS
│   ├── main.js                   ← Entry point
│   ├── app.module.js
│   ├── modules/
│   ├── entities/
│   ├── public/                   ← Frontend static files (copied)
│   │   ├── .next/
│   │   │   ├── static/
│   │   │   │   ├── chunks/
│   │   │   │   └── css/
│   │   │   └── standalone/
│   │   │       └── index.html
│   │   └── (other static assets)
│   └── (other compiled code)
│
├── src/                           ← TypeScript source
├── node_modules/
├── package.json
└── uploads/                       ← Runtime storage
    ├── reports/
    └── (statement files)
```

## Runtime Request Processing

```
User Request: GET https://your-domain/categories
    │
    ├─ Express middleware
    │  ├─ Check if path starts with /api
    │  │  ├─ YES: Route to NestJS handler
    │  │  └─ NO: Serve static files or SPA
    │
    └─ NestJS Routing
       └─ /api/v1/categories
          ├─ JWT Auth Guard (check token)
          ├─ Authorization Guard (check permissions)
          ├─ CategoriesController
          └─ CategoriesService
             └─ Database Query (PostgreSQL)
```

## Frontend SPA Navigation

```
User clicks link in frontend (e.g., /reports)
    │
    ├─ React Router intercepts
    ├─ Updates URL to /reports
    ├─ Renders ReportsPage component
    └─ Component uses apiClient to fetch /api/v1/reports
       (makes API call to backend)

If user refreshes page (F5) at /reports
    │
    ├─ Browser requests https://domain/reports
    ├─ Express receives request
    ├─ Not an /api route, not a static file
    ├─ Express fallback middleware
    └─ Serves index.html
       └─ Next.js/React takes over
           └─ React Router loads ReportsPage again
```

## Database Connections

```
Application (Port 3001)
    │
    ├─ TypeORM Connection Pool
    │  └─ TCP Port 5432 (PostgreSQL)
    │     └─ Database: finflow
    │
    └─ Redis Connection
       └─ TCP Port 6379 (Redis)
          └─ Job Queue & Cache
```

## Environment & Configuration

```
Railway Environment Variables
    │
    ├─ JWT_SECRET → Passport JWT strategy
    ├─ JWT_REFRESH_SECRET → Refresh token strategy
    ├─ DATABASE_URL → TypeORM connection
    ├─ REDIS_HOST/PORT → BullMQ queue
    ├─ NODE_ENV=production → Disable logging, etc.
    └─ PORT=3001 → Server listening port

Build-time (Dockerfile)
    │
    ├─ npm install (frontend dependencies)
    ├─ npm run build (Next.js compilation)
    ├─ npm install (backend dependencies)
    └─ npm run build (NestJS compilation)
```

## Traffic Flow Summary

```
       FRONTEND REQUESTS                API REQUESTS
             │                              │
             ├─ GET /                    ├─ GET /api/v1/*
             ├─ GET /*.js                ├─ POST /api/v1/*
             ├─ GET /*.css               ├─ PUT /api/v1/*
             ├─ GET /images              ├─ DELETE /api/v1/*
             └─ GET /unknown-route       └─ GET /api/docs
                  │                           │
                  └─► Express/Next.js     └─► Express/NestJS
                      (SPA Serving)            (API Handling)
                      Falls back to            Routes to
                      index.html               Controllers
```

## Deployment Status Check

```
https://your-domain/api/v1/health
    │
    └─► {"status":"ok","timestamp":"2025-12-09T..."}
        
If this returns 200 → Application is running ✓

https://your-domain/
    │
    └─► <HTML> Frontend loads ✓

https://your-domain/api/docs
    │
    └─► Swagger UI loads ✓
```

This unified architecture means:
- ✅ No CORS issues (same origin)
- ✅ Single deployment point
- ✅ Efficient resource usage
- ✅ Simplified configuration
- ✅ Easy to monitor
