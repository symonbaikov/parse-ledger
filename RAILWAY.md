# Railway Deployment Guide

## Overview

This guide explains how to deploy FinFlow to Railway.

## Prerequisites

- Railway account (https://railway.app)
- Project connected to GitHub
- PostgreSQL and Redis services configured in Railway

## Deployment Steps

### 1. Connect Your GitHub Repository

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize and select `parse-ledger` repository

### 2. Configure Services

Railway will automatically detect:
- **Backend**: Node.js application (uses root `Dockerfile`)
- **Database**: PostgreSQL (configure separately)
- **Cache**: Redis (configure separately)

### 3. Set Environment Variables

In Railway dashboard, add these variables to your backend service:

```
# JWT Secrets (REQUIRED - Generate new ones!)
# Generate with: openssl rand -base64 32
JWT_SECRET=<generate-with-openssl>
JWT_REFRESH_SECRET=<generate-with-openssl>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Database (Railway auto-generates, but verify these match)
DATABASE_URL=postgresql://${{Postgres.PGUSER}}:${{Postgres.PGPASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/finflow

# Redis
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://<your-frontend-domain>

# Optional - Google Sheets OAuth
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
GOOGLE_REDIRECT_URI=https://<your-backend-domain>/api/v1/auth/google/callback

# Optional - Telegram Bot
TELEGRAM_BOT_TOKEN=<your-telegram-bot-token>
```

**⚠️ IMPORTANT: JWT_SECRET and JWT_REFRESH_SECRET must be set!**

Generate strong secrets:
```bash
openssl rand -base64 32
```

Copy the output to JWT_SECRET and JWT_REFRESH_SECRET environment variables in Railway.


### 4. Add PostgreSQL Service

1. In Railway project, click "Add Service"
2. Select "PostgreSQL"
3. Set database name to `finflow`
4. Railway will auto-generate credentials

### 5. Add Redis Service

1. Click "Add Service"
2. Select "Redis"
3. No additional configuration needed

### 6. Configure Deployment

Railway will automatically use the `Dockerfile` and `railway.json` for configuration.

Key settings:
- **Build Command**: Handled by Dockerfile
- **Start Command**: `node backend/dist/main.js`
- **Port**: 3001

### 7. Run Database Migrations

After first deployment, run migrations:

```bash
# Via Railway CLI
railway exec npm --prefix backend run migration:run

# Or manually in Railway dashboard using the Redis/Postgres plugin
```

### 8. Create Admin User (Optional)

```bash
railway exec npm --prefix backend run create-admin
```

## Deployment Architecture

```
Railway Project
├── Backend Service (Node.js/NestJS)
│   ├── Dockerfile (builds from root)
│   └── Runs on port 3001
├── PostgreSQL Service
│   └── Auto-provisioned database
└── Redis Service
    └── Auto-provisioned cache
```

## Frontend Deployment

For the Next.js frontend, deploy separately:

1. Create a new Railway project or add to existing
2. Point to `frontend/` directory
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Set PORT: 3000

## Monitoring & Logs

- View logs: Railway dashboard → Service → Logs
- Monitor CPU/Memory: Dashboard → Deployments
- Set up alerts for failures

## Troubleshooting

### Build fails with "cannot find module"

- Ensure `package-lock.json` exists in backend/
- Check Dockerfile is correctly building backend

### Database connection errors

- Verify `DATABASE_URL` environment variable is set
- Check PostgreSQL service is running
- Run migrations: `railway exec npm --prefix backend run migration:run`

### Port binding issues

- Ensure PORT is set to 3001 (or change in code)
- Check no other services are using same port

### Redis connection errors

- Verify Redis service is running
- Check `REDIS_HOST` and `REDIS_PORT` environment variables

## Production Checklist

- [ ] JWT secrets changed from defaults
- [ ] Database migrations run successfully
- [ ] CORS configured for frontend domain
- [ ] Environment variables set for all services
- [ ] SSL/TLS certificates enabled (Railway auto-enables)
- [ ] Monitoring and alerts configured
- [ ] Backup strategy for PostgreSQL data

## Rolling Back

If deployment fails:

1. Railway dashboard → Deployments
2. Select previous stable deployment
3. Click "Redeploy"

## Performance Tips

1. Use Railway's proximity features for lower latency
2. Enable database connection pooling
3. Configure Redis for caching
4. Monitor and optimize API response times

## Support

- Railway Documentation: https://docs.railway.app
- GitHub Issues: Report deployment issues
