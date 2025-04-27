import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  // Get the code from the URL
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Create a Supabase client configured to use cookies
  const supabase = createRouteHandlerClient({ cookies });

  if (code) {
    try {
      // Exchange the code for a session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error exchanging code for session:', error);
        return NextResponse.redirect(new URL('/auth/error', request.url));
      }
      
      // Successfully exchanged code for session
      console.log('Successfully authenticated user');
      
    } catch (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(new URL('/auth/error', request.url));
    }
  } else {
    console.error('No code provided in callback URL');
    return NextResponse.redirect(new URL('/auth/error?error=no_code', request.url));
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL('/account', request.url));
} 