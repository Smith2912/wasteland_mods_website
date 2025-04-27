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
    console.log('Session after exchange:', session ? 'Valid session created' : 'No session created');
    
  } catch (error) {
    console.error('Error in auth callback:', error);
    return NextResponse.redirect(new URL('/auth/error', request.url));
  }

  // URL to redirect to after sign in process completes - use the provided callbackUrl
  return NextResponse.redirect(new URL(callbackUrl, request.url));
} 