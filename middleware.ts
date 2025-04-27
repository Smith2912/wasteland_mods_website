import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This middleware runs before every request
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Create a Supabase client configured for middleware
  const supabase = createMiddlewareClient({ req, res })
  
  // Refresh session if expired - this is key to maintaining authentication
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Middleware session check:', session ? 'Valid session' : 'No session')
  
  return res
}

// Only run middleware on API routes related to authentication
export const config = {
  matcher: [
    // Skip static files and API routes that don't need auth 
    '/((?!_next/static|_next/image|favicon.ico|api/auth/steam|api/auth/discord).*)',
  ],
}; 