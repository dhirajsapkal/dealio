# 🚀 QUICK DEPLOY GUIDE - Get Your Demo Live in 10 Minutes!

## Step 1: GitHub Setup (2 minutes)

1. Go to https://github.com/new
2. Repository name: `dealio`
3. Make it **Public**
4. **Don't** check "Add a README file"
5. Click "Create repository"

After creating the repo, GitHub will show you commands. **Use these instead:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/dealio.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend to Railway (3 minutes)

1. **Go to: https://railway.app**
2. Click "Login" → "Login with GitHub"
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `dealio` repository
5. **IMPORTANT**: In settings, set **Root Directory** to: `backend`
6. Click "Deploy"
7. **Copy the deployment URL** (looks like: `https://backend-production-xxxx.up.railway.app`)

## Step 3: Deploy Frontend to Vercel (3 minutes)

1. **Go to: https://vercel.com**
2. Click "Sign Up" → "Continue with GitHub"
3. Click "New Project" → Import your `dealio` repository
4. **Before deploying:**
   - In "Environment Variables" section:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: [YOUR RAILWAY URL FROM STEP 2]
   - Environment: All (Production, Preview, Development)
5. Click "Deploy"

## Step 4: Test Your Live App! (2 minutes)

1. **Your live demo will be at:** `https://dealio-xxx.vercel.app`
2. **Test it:**
   - Click on guitar search
   - Try searching for "Fender Stratocaster"
   - Verify data loads from your deployed backend

## 🎯 Share Your Demo!

**Frontend (Demo Link):** Your Vercel URL
**Backend API:** Your Railway URL

**Total Time:** ~10 minutes
**Total Cost:** $0 (both services are free for demos!)

---

## Troubleshooting

- **CORS errors?** Wait 2-3 minutes for Railway to fully deploy
- **No data loading?** Check that `NEXT_PUBLIC_API_URL` in Vercel matches your Railway URL exactly
- **Railway build failing?** Make sure Root Directory is set to `backend`

## Quick Links
- [Railway Console](https://railway.app/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repository](https://github.com/YOUR_USERNAME/dealio) 