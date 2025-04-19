import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs before every request
export function middleware(request: NextRequest) {
  // Don't do anything special for API routes
  // We're using Supabase Auth which doesn't require middleware processing
  return NextResponse.next();
}

// Only run middleware on API routes related to authentication
export const config = {
  matcher: [
    '/api/auth/:path*',
  ],
}; 