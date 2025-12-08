# Quick Fix - 5 Minutes

## Your Issue
App crashes on startup - SyntaxError and database connection error

## What I Fixed
✅ Removed problematic code that caused the SyntaxError
✅ Simplified the setup - just backend API for now

## What YOU Need to Do (Right Now)

### 1. In Railway Dashboard - Add PostgreSQL
```
Click: "+ Add" button
Select: "PostgreSQL" under Databases
Wait: Until it says "Online"
```

### 2. Add These Variables to Backend Service

Click: **parse-ledger-production** service
Click: **"Variables"** tab
Add these **exact** lines:

```
DATABASE_URL=postgresql://${{Postgres.PGUSER}}:${{Postgres.PGPASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/finflow
NODE_ENV=production
PORT=3001
```

Verify these are already there:
```
JWT_SECRET=<should-have-value>
JWT_REFRESH_SECRET=<should-have-value>
```

### 3. Redeploy
```
Click: "Deployments" tab
Click: Three-dot menu on latest deployment
Click: "Redeploy"
Wait: 2-3 minutes for build
Check: Deploy Logs - should see "Application is running"
```

### 4. Test
```
Visit: https://your-railway-domain/api/v1/health
Should see: {"status":"ok","timestamp":"..."}
```

## If Still Crashing
Check Deploy Logs:
- "Unable to connect to database" → DATABASE_URL is wrong
- "JWT_SECRET is not set" → Add the JWT secrets
- Any other error → Send me the exact error message

**That's it! Should be working in 5 minutes.** ✅
