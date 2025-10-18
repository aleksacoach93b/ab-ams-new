# 🚀 VERCEL DEPLOYMENT - FINAL STEPS

## ✅ ŠTA SAM POPRAVIO:

1. **Error Handling** - Dodao bolje error handling u sve API rute
2. **Production Config** - Kreirao vercel.json konfiguraciju
3. **Database Connection** - Popravio Prisma konfiguraciju za production
4. **JWT Security** - Dodao provere za JWT_SECRET
5. **Build Scripts** - Dodao vercel-build script
6. **Test API** - Kreirao /api/vercel-test za testiranje

## 🔧 SLEDEĆI KORACI ZA VERCEL:

### 1. Deploy na Vercel (5 minuta)

1. **Idi na [vercel.com](https://vercel.com)**
2. **Login sa GitHub account**
3. **Click "New Project"**
4. **Import `ab-ams` repository**
5. **Click "Import"**

### 2. Environment Variables (2 minuta)

Dodaj ove **tačne** environment variables u Vercel:

```env
DATABASE_URL=postgresql://postgres:Teodor06022025@db.jgcjfqcswnzliwzjbtje.supabase.co:5432/postgres
JWT_SECRET=ab-ams-super-secret-jwt-key-2024-production
NEXTAUTH_SECRET=ab-ams-nextauth-secret-2024-production
NEXTAUTH_URL=https://ab-ams.vercel.app
NEXT_PUBLIC_APP_URL=https://ab-ams.vercel.app
NEXT_PUBLIC_APP_NAME=AB - AMS
```

### 3. Deploy Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 4. Deploy (5 minuta)

1. **Click "Deploy"**
2. **Čekaj da se završi** (5-10 minuta)
3. **Zapamti URL** (biće nešto kao `https://ab-ams-xyz.vercel.app`)

### 5. Test Deployment (2 minuta)

1. **Idi na `/api/vercel-test`** - trebalo bi da vidiš success poruku
2. **Idi na `/api/health`** - trebalo bi da vidiš health check
3. **Idi na glavnu stranicu** - trebalo bi da te preusmeri na login

### 6. Database Setup (3 minuta)

Nakon što se deploy završi, pokreni:

```bash
# Instaliraj Vercel CLI
npm i -g vercel

# Login u Vercel
vercel login

# Link projekat
vercel link

# Pull environment variables
vercel env pull .env.local

# Pokreni migration
npx prisma migrate deploy

# Kreiraj admin user
npx tsx scripts/setup-production.ts
```

## 🎯 ADMIN CREDENTIALS:

- **Email**: aleksacoach@gmail.com
- **Password**: Teodor06022025

## 🔍 TROUBLESHOOTING:

**Ako vidiš "Internal Server Error":**

1. **Proveri environment variables** u Vercel dashboard
2. **Proveri build logs** u Vercel
3. **Testiraj `/api/vercel-test`** endpoint
4. **Proveri da li je DATABASE_URL ispravan**

**Ako ne možeš da se uloguješ:**

1. **Proveri da li je admin user kreiran**
2. **Pokreni `npx tsx scripts/setup-production.ts`**
3. **Proveri JWT_SECRET u environment variables**

## 📱 FINALNI REZULTAT:

Tvoja aplikacija će biti dostupna na:
`https://ab-ams-[random].vercel.app`

## 🚀 READY TO DEPLOY!

Sada je sve spremno za deployment. Samo prati korake iznad i aplikacija će raditi bez "internal error" grešaka!

**Idi na Vercel i deploy-uj aplikaciju!** 🎉
