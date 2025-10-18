import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // This endpoint will help set up the environment after deployment
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
      JWT_SECRET: process.env.JWT_SECRET ? 'Set' : 'Not set',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not set',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME ? 'Set' : 'Not set'
    }

    const missingVars = Object.entries(envVars)
      .filter(([key, value]) => value === 'Not set')
      .map(([key]) => key)

    if (missingVars.length > 0) {
      return NextResponse.json({
        status: 'missing_env_vars',
        message: 'Environment variables are missing',
        missing: missingVars,
        instructions: {
          step1: 'Go to Vercel Dashboard',
          step2: 'Navigate to your project settings',
          step3: 'Go to Environment Variables',
          step4: 'Add the missing variables',
          step5: 'Redeploy the application'
        },
        requiredVars: {
          DATABASE_URL: 'postgresql://postgres:Teodor06022025@db.jgcjfqcswnzliwzjbtje.supabase.co:5432/postgres',
          JWT_SECRET: 'ab-ams-super-secret-jwt-key-2024-production',
          NEXTAUTH_SECRET: 'ab-ams-nextauth-secret-2024-production',
          NEXTAUTH_URL: 'https://ab-ams.vercel.app',
          NEXT_PUBLIC_APP_URL: 'https://ab-ams.vercel.app',
          NEXT_PUBLIC_APP_NAME: 'AB - AMS'
        }
      }, { status: 400 })
    }

    return NextResponse.json({
      status: 'success',
      message: 'All environment variables are set',
      envVars
    })

  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Failed to check environment variables',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
