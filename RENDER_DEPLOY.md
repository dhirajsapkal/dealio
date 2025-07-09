# 🚀 Deploy Backend to Render (Alternative to Railway)

## Quick Backend Deployment

1. **Go to: https://render.com**
2. **Sign up with GitHub**
3. **"New" → "Web Service"**
4. **Connect `dhirajsapkal/dealio` repository**
5. **Settings:**
   - **Name:** `dealio-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. **Deploy!**

You'll get a URL like: `https://dealio-backend.onrender.com`

## Then Update Frontend

Once backend is deployed:
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on your `dealio` project
3. Go to "Settings" → "Environment Variables"
4. Add: `NEXT_PUBLIC_API_URL` = `https://your-render-backend-url`
5. Redeploy frontend

## Result
- **Frontend:** https://dealio-2ucr9b3cf-dhirajsapkals-projects.vercel.app
- **Backend:** https://your-render-backend-url
- **Fully connected app with real API calls!** 