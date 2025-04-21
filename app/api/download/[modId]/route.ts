import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { hasUserPurchasedMod } from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { modId: string } }
) {
  try {
    // Create a Supabase client using cookies for authentication
    const cookieStore = cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Create client with cookies using ssr helper
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            // This is an API route, we don't need to set cookies here
          },
          remove(name, options) {
            // This is an API route, we don't need to remove cookies here
          },
        },
      }
    );
    
    // Get the current session to verify authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      return NextResponse.json({ 
        error: 'Failed to get session',
        details: sessionError.message
      }, { status: 500 });
    }
    
    if (!session) {
      // Redirect to login if not authenticated
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/mods', request.url));
    }
    
    // Verify the user has purchased this mod
    const modId = params.modId;
    const hasPurchased = await hasUserPurchasedMod(session.user.id, modId);
    
    if (!hasPurchased) {
      console.log(`User ${session.user.id} attempted to download mod ${modId} without purchase`);
      return NextResponse.redirect(new URL('/store?error=not_purchased', request.url));
    }
    
    // Create service client for generating signed URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is missing');
      return NextResponse.json({ 
        error: 'Server configuration error',
      }, { status: 500 });
    }
    
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    
    // Generate a signed URL valid for 5 minutes (300 seconds)
    const { data, error } = await serviceClient.storage
      .from('mods')
      .createSignedUrl(`${modId}/${modId}-latest.zip`, 300, {
        download: true, // Force download instead of opening in browser
      });
    
    if (error) {
      console.error('Error generating signed URL:', error);
      return NextResponse.json({ 
        error: 'Failed to generate download link',
      }, { status: 500 });
    }
    
    // Log the download attempt
    console.log(`User ${session.user.id} downloading mod ${modId}`);
    
    // Redirect to the signed URL for download
    return NextResponse.redirect(data.signedUrl);
    
  } catch (error) {
    console.error('Unexpected error in download endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 