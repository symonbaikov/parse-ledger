# Deployment Checklist - Frontend Serving

## ✅ Changes Completed

- [x] **Dockerfile** - Builds frontend and backend, copies static files
- [x] **Next.js Config** - Set `output: "standalone"` for optimized build
- [x] **Backend main.ts** - Added static file serving and fallback routes
- [x] **App Controller** - Added root handler for frontend serving
- [x] **Root package.json** - Updated build script to build frontend first
- [x] **RAILWAY.md** - Updated with unified deployment instructions

## 📋 Pre-Deployment Checklist

Before pushing to Railway:

- [ ] Commit all changes: `git add -A && git commit -m "feat: unified frontend and backend serving"`
- [ ] Push to GitHub: `git push origin main`
- [ ] Verify no build errors locally: `npm run build && npm start`

## 🚀 Deployment Steps

1. **Push to GitHub**
   ```bash
   git add -A
   git commit -m "feat: unified frontend and backend serving"
   git push origin main
   ```

2. **Railway Auto-Deploy**
   - Railway should automatically detect the changes
   - Build will:
     - Install dependencies for frontend
     - Build Next.js frontend
     - Install dependencies for backend
     - Build NestJS backend
     - Copy frontend files to backend
     - Start backend on port 3001

3. **Verify Deployment**
   - Check Railway deployment logs
   - Visit `https://your-railway-domain/` (should show frontend)
   - Visit `https://your-railway-domain/api/v1/health` (should show API response)
   - Visit `https://your-railway-domain/api/docs` (should show Swagger)

4. **Run Migrations** (if first time)
   ```bash
   railway exec npm --prefix backend run migration:run
   ```

## 🐛 Troubleshooting

### Build fails: "Cannot find module"
- Ensure `package-lock.json` exists in both backend and frontend
- Check internet connectivity during build
- Increase Railway's build timeout if needed

### Frontend returns 404
- Check that Next.js build succeeded in Docker
- Verify `output: "standalone"` is set in next.config.ts
- Check Railway logs for exact error

### API returns 404
- Ensure NestJS built successfully
- Verify `app.setGlobalPrefix('api/v1')` is in main.ts
- Check that routes are properly defined

### Frontend shows "Cannot GET /"
- Next.js build might have failed
- Check Dockerfile for correct path to .next folder
- Verify frontend files were copied correctly

## 📊 Performance Notes

- **Build Time**: ~3-5 minutes (frontend build takes time)
- **Container Size**: ~400-500 MB (includes both apps)
- **Memory**: ~200 MB at rest, can spike during startup
- **Cold Start**: ~30 seconds

## 🔄 Local Development

For local testing before deployment:

```bash
# Terminal 1: Backend
cd backend
npm install
npm run start:dev

# Terminal 2: Frontend
cd frontend
npm install
npm run dev

# Both will run:
# Backend: http://localhost:3001/api/v1
# Frontend: http://localhost:3000
```

To test production build locally:

```bash
npm run build
npm start
# Single process on http://localhost:3001
```

## 📚 Documentation Files

Created:
- `FRONTEND_SERVING_SUMMARY.md` - Technical details of the setup
- Updated `RAILWAY.md` - Deployment instructions

## 🎯 Next Phase (After Successful Deployment)

1. Database migrations
2. Create admin user
3. Configure Google Sheets integration
4. Configure Telegram bot
5. Monitor application logs and performance
