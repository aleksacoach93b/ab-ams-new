#!/bin/bash

echo "🚀 Starting Vercel deployment for AB-AMS..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Found package.json"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

echo "✅ Build completed successfully!"

echo ""
echo "🌐 Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Login with your account: aleksacoach@gmail.com"
echo "3. Click 'New Project'"
echo "4. Import your GitHub repository: ab-ams"
echo "5. Add these environment variables:"
echo ""
echo "DATABASE_URL=postgresql://postgres:Teodor06022025@db.jgcjfqcswnzliwzjbtje.supabase.co:5432/postgres"
echo "JWT_SECRET=ab-ams-super-secret-jwt-key-2024-production"
echo "NEXTAUTH_SECRET=ab-ams-nextauth-secret-2024-production"
echo "NEXTAUTH_URL=https://ab-ams.vercel.app"
echo "NEXT_PUBLIC_APP_URL=https://ab-ams.vercel.app"
echo "NEXT_PUBLIC_APP_NAME=AB - AMS"
echo ""
echo "6. Click 'Deploy'"
echo ""
echo "🎉 Your app will be live at: https://ab-ams-[random].vercel.app"
echo ""
echo "📧 Admin credentials:"
echo "Email: aleksacoach@gmail.com"
echo "Password: Teodor06022025"
