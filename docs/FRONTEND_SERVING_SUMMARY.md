# Frontend Serving Configuration - Summary

## Changes Made

To serve the frontend and backend from the same Railway instance, the following changes were implemented:

### 1. Dockerfile Updates
- **File**: `/Dockerfile` (root level)
- **Changes**:
  - Build Next.js frontend with `output: "standalone"` mode
  - Build NestJS backend
  - Copy frontend build artifacts to backend's public folder
  - Run single backend process on port 3001

### 2. Frontend Configuration
- **File**: `frontend/next.config.ts`
- **Changes**:
  - Set `output: "standalone"` to create optimized, portable build
  - This allows Next.js to be embedded in another process

### 3. Backend Static File Serving
- **File**: `backend/src/main.ts`
- **Changes**:
  - Added express static middleware to serve frontend files
  - Added fallback route for client-side navigation
  - Frontend files served from `/` (root)
  - API still available at `/api/v1`
  - Swagger docs at `/api/docs`

### 4. Root Controller
- **File**: `backend/src/app.controller.ts`
- **Changes**:
  - Added root `@Get()` handler
  - Serves frontend index.html for root path
  - Fallback to API info JSON if frontend not built

### 5. Root Package.json
- **File**: `package.json` (root level)
- **Changes**:
  - Updated build script to build frontend THEN backend
  - Ensures frontend files are available when backend builds

### 6. Documentation
- **File**: `RAILWAY.md`
- **Changes**:
  - Updated deployment instructions
  - Clarified unified architecture (one service, both frontend and backend)
  - Removed separate frontend deployment instructions

## How It Works

1. **Build Phase** (in Dockerfile):
   ```
   frontend/ → npm run build → .next/standalone/
      ↓
   backend/ → npm run build → dist/
   Copy frontend → backend/dist/public/
   ```

2. **Runtime**:
   - Backend runs on port 3001
   - Express middleware serves static files from `/` and `/api/v1/*`
   - Client-side routes fall back to frontend's index.html
   - All API calls to `/api/v1` are handled by NestJS

## Access Points

- **Root**: `https://your-domain/` → Frontend
- **API**: `https://your-domain/api/v1` → Backend API
- **Docs**: `https://your-domain/api/docs` → Swagger Documentation
- **Health**: `https://your-domain/api/v1/health` → Health check

## Local Development

Development still works with separate processes:
```bash
npm run dev
# Runs backend on 3001 and frontend on 3000 separately
```

For production-like testing:
```bash
npm run build
npm start
# Builds both and runs single backend serving both
```

## Benefits

✅ Single container for deployment
✅ Simplified Railway configuration
✅ No CORS issues (same origin)
✅ Efficient resource usage
✅ Faster builds and deployments
✅ Easier environment variable sharing

## Next Steps

1. Commit and push these changes to GitHub
2. Railway will automatically rebuild
3. Once built, the entire application will be accessible from the single domain
4. Run database migrations via `railway exec npm --prefix backend run migration:run`
