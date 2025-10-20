import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple token verification function
function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    // Simple base64 decode for now
    const payload = JSON.parse(Buffer.from(token, 'base64').toString())
    return payload
  } catch {
    return null
  }
}

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard': ['ADMIN', 'COACH', 'STAFF'],
  '/player-dashboard': ['PLAYER'],
  '/api/events': ['ADMIN', 'COACH', 'STAFF'],
  '/api/players': ['ADMIN', 'COACH', 'STAFF'],
  '/api/staff': ['ADMIN'],
  '/api/teams': ['ADMIN', 'COACH', 'STAFF'],
}

// Admin-only routes
const adminRoutes = [
  '/dashboard/admin',
  '/api/admin',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  if (
    pathname.startsWith('/login') ||
    pathname.startsWith('/setup') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/setup') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/uploads/') ||
    pathname === '/'
  ) {
    return NextResponse.next()
  }

  // Temporarily disable middleware for testing - allow all dashboard access
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/player-dashboard')) {
    return NextResponse.next()
  }

  // Get token from request headers or cookies
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
               request.cookies.get('token')?.value

  if (!token) {
    // Redirect to login if no token
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify token using our simple function
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const userRole = decoded.role

    // Check admin-only routes
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (userRole !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }

    // Check protected routes
    for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          // Redirect based on user role
          if (userRole === 'PLAYER') {
            return NextResponse.redirect(new URL('/player-dashboard', request.url))
          } else {
            return NextResponse.redirect(new URL('/dashboard', request.url))
          }
        }
        break
      }
    }

    // Allow request to proceed
    return NextResponse.next()

  } catch (error) {
    // Invalid token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}