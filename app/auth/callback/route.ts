import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// We need to use createRouteHandlerClient here since this is a server component
export async function GET(request: NextRequest) {
  // Get the code from the URL
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  // Get the callback URL if provided
  const callbackUrl = requestUrl.searchParams.get('callbackUrl') || '/account';
  
  if (!code) {
    console.error('No code provided in callback URL');
    return NextResponse.redirect(new URL('/auth/error?error=no_code', request.url));
  }
  
  // Create a Supabase client configured to use cookies
  const supabase = createRouteHandlerClient({ cookies });

  try {
    console.log('Exchange code for session - starting');
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth/error', request.url));
    }
    
    // Successfully exchanged code for session
    console.log('Successfully authenticated user');
    
    // Get the session to verify it worked
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('Session after exchange: Valid session created');
      console.log('User ID:', session.user.id);
      
      // Check if expires_at is defined
      if (session.expires_at) {
        console.log('Session expires at:', new Date(session.expires_at * 1000).toISOString());
      } else {
        console.log('Session expiration time not available');
      }
      
      // Make sure cookies are properly set
      const res = NextResponse.redirect(new URL(callbackUrl, request.url));
      
      // Add debug headers (these won't be visible to users but help with debugging)
      res.headers.set('X-Auth-Debug', 'Session successfully created');
      
      return res;
    } else {
      console.error('No session after exchange - this should not happen');
      return NextResponse.redirect(new URL('/auth/error?error=no_session_after_exchange', request.url));
    }
    
  } catch (error) {
    console.error('Error in auth callback:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }
} 