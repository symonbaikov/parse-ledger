# Railway Setup - Database Connection Fix

## Current Issue

The application crashed because `DATABASE_URL` environment variable is not set or PostgreSQL is not connected.

## What You Need to Do in Railway Dashboard

### Step 1: Add PostgreSQL Service

1. Go to https://railway.app/project/[your-project-id]
2. Click the **"+ Add"** button (top right of services)
3. Select **"Database"** → **"PostgreSQL"**
4. Wait for it to be provisioned (shows as "Online")

### Step 2: Link PostgreSQL to Backend Service

1. Click on the **PostgreSQL** service box
2. Look for the connection details or environment variables
3. Copy the full connection string, OR
4. Note: Railway auto-generates DATABASE_URL when services are linked

### Step 3: Set DATABASE_URL in Backend Service

1. Click on your **parse-ledger-production** service
2. Go to **"Variables"** tab
3. Add this variable:

```
DATABASE_URL=postgresql://${{Postgres.PGUSER}}:${{Postgres.PGPASSWORD}}@${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/finflow
```

Alternative (if Railway shows different names):
```
DATABASE_URL=postgresql://${{Postgres.PGUSER}}:${{Postgres.PGPASSWORD}}@${{Postgres.POSTGRES_HOST}}:${{Postgres.POSTGRES_PORT}}/finflow
```

### Step 4: Verify Other Required Variables

In the same **Variables** tab, ensure you also have:

```
# Required
JWT_SECRET=<your-secret>
JWT_REFRESH_SECRET=<your-secret>
NODE_ENV=production
PORT=3001

# Database (the one you just added)
DATABASE_URL=postgresql://...

# Redis (if you have Redis service)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
REDIS_PASSWORD=${{Redis.REDIS_PASSWORD}}
```

### Step 5: Redeploy

1. Go to **"Deployments"** tab
2. Find the latest failed deployment
3. Click the **"Redeploy"** button

The app should now start successfully.

## How to Find Your PostgreSQL Variables in Railway

If the variable substitution doesn't work:

1. Click on PostgreSQL service
2. Look at **"Variables"** tab
3. You'll see:
   - PGUSER
   - PGPASSWORD
   - PGHOST (or POSTGRES_HOST)
   - PGPORT (or POSTGRES_PORT)
   - DATABASE_URL (if auto-generated)

Use the exact names shown there in your backend service variables.

## Database Setup

The application will:
1. Connect to the PostgreSQL database
2. Run migrations automatically on startup
3. Create necessary tables

No manual SQL commands needed.

## Quick Checklist

- [ ] PostgreSQL service created and showing "Online"
- [ ] DATABASE_URL variable added to backend service
- [ ] JWT_SECRET and JWT_REFRESH_SECRET set
- [ ] Deployment redeployed
- [ ] Check Deploy Logs for "Application is running"

## If Still Crashing

Check the **Deploy Logs** tab for errors:
- "Unable to connect to database" → DATABASE_URL is wrong/missing
- "JWT_SECRET" error → Set those secrets
- "SyntaxError" → Code compilation error (should be fixed now)

Let me know what error you see!
