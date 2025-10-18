# 🚀 VERCEL ENVIRONMENT VARIABLES SETUP

## ⚠️ VAŽNO: Dodaj Environment Variables u Vercel Dashboard

Deployment je neuspešan jer nedostaju environment variables. Evo kako da ih dodaš:

### 1. Idi na Vercel Dashboard
1. **Idi na [vercel.com](https://vercel.com)**
2. **Login sa: aleksacoach@gmail.com**
3. **Pronađi projekat: `ultrax-wellness-app`**

### 2. Dodaj Environment Variables
1. **Klikni na projekat**
2. **Idi na "Settings" tab**
3. **Klikni na "Environment Variables"**
4. **Dodaj sledeće variables:**

#### DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: `postgresql://postgres:Teodor06022025@db.jgcjfqcswnzliwzjbtje.supabase.co:5432/postgres`
- **Environment**: Production, Preview, Development

#### JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: `ab-ams-super-secret-jwt-key-2024-production`
- **Environment**: Production, Preview, Development

#### NEXTAUTH_SECRET
- **Name**: `NEXTAUTH_SECRET`
- **Value**: `ab-ams-nextauth-secret-2024-production`
- **Environment**: Production, Preview, Development

#### NEXTAUTH_URL
- **Name**: `NEXTAUTH_URL`
- **Value**: `https://ultrax-wellness-3yzeed8r2-aleksas-projects-0b0c59c9.vercel.app`
- **Environment**: Production, Preview, Development

#### NEXT_PUBLIC_APP_URL
- **Name**: `NEXT_PUBLIC_APP_URL`
- **Value**: `https://ultrax-wellness-3yzeed8r2-aleksas-projects-0b0c59c9.vercel.app`
- **Environment**: Production, Preview, Development

#### NEXT_PUBLIC_APP_NAME
- **Name**: `NEXT_PUBLIC_APP_NAME`
- **Value**: `AB - AMS`
- **Environment**: Production, Preview, Development

### 3. Redeploy
1. **Nakon što dodaš sve environment variables**
2. **Idi na "Deployments" tab**
3. **Klikni na "Redeploy" na poslednjem deployment-u**

### 4. Test
1. **Idi na: https://ultrax-wellness-3yzeed8r2-aleksas-projects-0b0c59c9.vercel.app**
2. **Testiraj `/api/vercel-test` endpoint**
3. **Testiraj login sa:**
   - **Email**: aleksacoach@gmail.com
   - **Password**: Teodor06022025

## 🎯 Tvoja aplikacija je već deploy-ovana na:
**https://ultrax-wellness-3yzeed8r2-aleksas-projects-0b0c59c9.vercel.app**

Samo treba da dodaš environment variables i redeploy-uješ!
