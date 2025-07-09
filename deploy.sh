#!/bin/bash

echo "🚀 Dealio Deployment Helper"
echo "=========================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit for deployment"
    echo "✅ Git repository initialized"
    echo "📝 Next: Create a GitHub repository and run:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/dealio.git"
    echo "   git push -u origin main"
    echo ""
else
    echo "✅ Git repository found"
fi

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "📝 Uncommitted changes found. Committing..."
    git add .
    git commit -m "Updates for deployment"
    echo "✅ Changes committed"
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Push your code to GitHub (if not done already)"
echo "2. Deploy backend to Railway: https://railway.app"
echo "3. Deploy frontend to Vercel: https://vercel.com"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
echo ""
echo "🔗 Quick Links:"
echo "   Railway: https://railway.app"
echo "   Vercel: https://vercel.com"
echo ""
echo "✨ Good luck with your demo!" 