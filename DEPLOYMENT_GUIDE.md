# 🚀 Complete Deployment Guide

## ✅ Step 1: GitHub (COMPLETED)
- ✅ Code pushed to GitHub repository
- ✅ All changes committed and merged
- ✅ Repository ready for deployment

## 📋 Step 2: Supabase Database Setup

### 2.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your account
3. Click **"New Project"**
4. Fill in project details:
   - **Project Name**: `ab-ams`
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"**

### 2.2 Get Database Connection String
1. Go to **Settings → Database**
2. Find **"Connection string"** section
3. Copy the **URI** connection string
4. Replace `[YOUR-PASSWORD]` with your actual password

**Example connection string:**
```
postgresql://postgres:yourpassword@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## 🌐 Step 3: Vercel Deployment

### 3.1 Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login (use GitHub account)
3. Click **"New Project"**
4. Import your `ab-ams` repository
5. Click **"Import"**

### 3.2 Configure Environment Variables
In Vercel dashboard, add these environment variables:

```env
DATABASE_URL=postgresql://postgres:yourpassword@db.abcdefghijklmnop.supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
NEXTAUTH_SECRET=your-nextauth-secret-here-change-this-in-production
NEXTAUTH_URL=https://your-app-name.vercel.app
RESEND_API_KEY=your-resend-api-key-here
BLOB_READ_WRITE_TOKEN=your-vercel-blob-token-here
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_NAME=AB - AMS
```

### 3.3 Deploy
1. Click **"Deploy"**
2. Wait for deployment to complete (5-10 minutes)
3. Note your app URL (e.g., `https://ab-ams-xyz.vercel.app`)

## 🗄️ Step 4: Database Migration

### 4.1 Run Database Migration
After Vercel deployment is complete:

1. **Option A: Using Vercel CLI (Recommended)**
   ```bash
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull .env.local
   npx prisma migrate deploy
   npm run db:seed:production
   ```

2. **Option B: Using Supabase Dashboard**
   - Go to Supabase SQL Editor
   - Run the Prisma migration SQL manually

### 4.2 Create Admin User
Run the production seed script:
```bash
npm run db:seed:production
```

This will create:
- **Email**: aleksacoach@gmail.com
- **Password**: Teodor06022025

## 🧪 Step 5: Testing

### 5.1 Test Your Deployment
1. Visit your Vercel app URL
2. Try to login with admin credentials
3. Test key features:
   - ✅ User login
   - ✅ Player management
   - ✅ Event creation
   - ✅ File uploads
   - ✅ Admin dashboard

### 5.2 Common Issues & Solutions

**Issue**: Database connection error
**Solution**: Check DATABASE_URL in Vercel environment variables

**Issue**: Build fails
**Solution**: Check that all environment variables are set

**Issue**: Admin user not created
**Solution**: Run `npm run db:seed:production` manually

## 📱 Step 6: Mobile Access

Your app will be accessible at:
- **URL**: `https://your-app-name.vercel.app`
- **Mobile**: Works on all devices
- **Admin Login**: aleksacoach@gmail.com / Teodor06022025

## 🔧 Step 7: Optional Services

### 7.1 Email Service (Resend)
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to Vercel environment variables

### 7.2 File Storage (Vercel Blob)
1. Go to Vercel dashboard
2. Navigate to Storage
3. Create Blob storage
4. Get token and add to environment variables

## 🎉 Success!

Once all steps are completed, your AB - Athlete Management System will be:
- ✅ Live on Vercel
- ✅ Connected to Supabase database
- ✅ Accessible from anywhere
- ✅ Mobile-friendly
- ✅ Production-ready

## 📞 Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Check Supabase database logs
3. Verify all environment variables are set
4. Test database connection

**Your app URL**: `https://your-app-name.vercel.app`
