# Dealio Deployment Guide

This guide will help you deploy your Dealio application temporarily for demo purposes.

## Architecture

- **Frontend**: Next.js app deployed on Vercel
- **Backend**: FastAPI app deployed on Railway
- **Database**: SQLite (included with backend deployment)

## Prerequisites

1. GitHub account
2. Vercel account (free)
3. Railway account (free)

## Step 1: Deploy the Backend (Railway)

### 1.1 Prepare the Repository
First, ensure your code is in a Git repository:

```bash
# If not already a git repo
git init
git add .
git commit -m "Initial commit for deployment"

# Push to GitHub (create a new repo on GitHub first)
git remote add origin https://github.com/YOUR_USERNAME/dealio.git
git push -u origin main
```

### 1.2 Deploy to Railway

1. Go to [Railway.app](https://railway.app)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `dealio` repository
6. Select the `backend` folder as the root directory
7. Railway will automatically detect it's a Python app
8. Click "Deploy"

### 1.3 Configure Railway Environment

Once deployed:
1. Go to your Railway project dashboard
2. Click on your service
3. Go to "Variables" tab
4. Add these environment variables:
   - `PORT`: `8000` (Railway will override this automatically)
   - `PYTHON_VERSION`: `3.9`

### 1.4 Get Backend URL

After deployment completes:
1. Go to "Settings" tab
2. Under "Domains", you'll see your Railway URL (e.g., `https://backend-production-xxxx.up.railway.app`)
3. Copy this URL - you'll need it for frontend deployment

## Step 2: Deploy the Frontend (Vercel)

### 2.1 Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your `dealio` repository
5. Vercel will automatically detect it's a Next.js app
6. **Important**: Set the Root Directory to `/` (not `/src`)

### 2.2 Configure Environment Variables

Before deploying:
1. In the Vercel deployment screen, expand "Environment Variables"
2. Add:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: Your Railway backend URL (from Step 1.4)
   - **Environment**: All (Production, Preview, Development)

### 2.3 Deploy

Click "Deploy" and wait for completion.

## Step 3: Update CORS (If Needed)

If you get CORS errors:
1. Note your Vercel frontend URL (e.g., `https://dealio-xxx.vercel.app`)
2. Update the CORS settings in `backend/main.py` if needed
3. Redeploy the backend

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Navigate to guitar search functionality
3. Verify the app can connect to the backend API

## Troubleshooting

### Backend Issues
- Check Railway logs: Project Dashboard → Service → "Logs" tab
- Verify environment variables are set correctly
- Check that `/health` endpoint returns success

### Frontend Issues
- Check Vercel function logs: Project Dashboard → "Functions" tab
- Verify `NEXT_PUBLIC_API_URL` environment variable
- Check browser console for CORS or network errors

### Database Issues
- SQLite database is created automatically on first run
- Check Railway logs for database initialization messages

## Demo URLs

After successful deployment, you'll have:
- **Frontend**: `https://your-app-name.vercel.app`
- **Backend API**: `https://your-service-name.up.railway.app`
- **API Health Check**: `https://your-service-name.up.railway.app/health`

## Cost

Both services offer generous free tiers:
- **Vercel**: 100GB bandwidth, unlimited deployments
- **Railway**: 500 hours/month, 1GB RAM, 1GB storage

Perfect for demo purposes!

## Cleanup

When you're done with the demo:
1. Delete the Railway project
2. Delete the Vercel project
3. This will stop all charges and resource usage 