# Development Setup Guide

## Quick Start - Dual Environment

This project is configured to run seamlessly in both local development and production environments.

### Local Development (Fastest iteration)

1. **Start Backend Locally** (Terminal 1):
   ```bash
   cd backend
   source venv/bin/activate  # or `venv\Scripts\activate` on Windows
   python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start Frontend Locally** (Terminal 2):
   ```bash
   npm run dev
   ```

   The frontend will automatically connect to `http://localhost:8000` (configured in `.env.local`)

### Production Testing (Test deployed backend)

1. **Update .env.local** to use production backend:
   ```bash
   # Comment out local URL and uncomment production URL in .env.local
   # NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_API_URL=https://dealio-backend.onrender.com
   ```

2. **Start Frontend**:
   ```bash
   npm run dev
   ```

### Deploy to Production

When everything works locally, deploy both:

```bash
# Deploy Backend (auto-deploy via git push)
git add .
git commit -m "Your changes"
git push

# Deploy Frontend (Vercel auto-deploys from git)
# Frontend will use NEXT_PUBLIC_API_URL from Vercel environment variables
```

## Environment Variables

### Local Development (`.env.local`)
- `NEXT_PUBLIC_API_URL=http://localhost:8000`

### Production (Vercel Dashboard)
- `NEXT_PUBLIC_API_URL=https://dealio-backend.onrender.com`

### Backend Environment Variables (Render Dashboard)
- `UNSPLASH_ACCESS_KEY=HYfkuol6lFF-kuzG4IrD6-CZAFtami41qhSlJ0jn1pc`
- `REVERB_ACCESS_TOKEN=b3d5326753d592a76778cf23f7df94e67a8c8e651c4b92b75e8452c3611c2b43`

## Development Workflow

✅ **Recommended Fast Development Cycle:**
1. Code changes → Test locally (`npm run dev` + local backend)
2. When satisfied → `git push` (auto-deploys to production)
3. Test production at https://dealio-three.vercel.app

❌ **Avoid:** Waiting for Vercel builds for every small change

## Troubleshooting

### API Connection Issues
- Check console for API URL being used
- Verify `.env.local` has correct `NEXT_PUBLIC_API_URL`
- Test backend directly: `curl http://localhost:8000/health`

### Backend Issues
- Check if backend is running: `http://localhost:8000/health`
- Verify Python environment is activated
- Check for missing dependencies: `pip install -r requirements.txt` 