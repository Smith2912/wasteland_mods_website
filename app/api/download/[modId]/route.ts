import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hasUserPurchasedMod, logModDownload } from '@/app/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { modId: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Create standard client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get auth token - first from query parameter (for direct links)
    const searchParams = request.nextUrl.searchParams;
    const tokenFromQuery = searchParams.get('token');
    
    // Then check for header (for API calls)
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : null;
    
    // Use the first available token
    const token = tokenFromQuery || tokenFromHeader;
    
    // If no token is found, redirect to login
    if (!token) {
      console.log('No authentication token found, redirecting to login');
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/mods', request.url));
    }
    
    // Validate the user with their token
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !userData?.user) {
      console.error('Error validating user token:', userError || 'No user data returned');
      return NextResponse.redirect(new URL('/auth/signin?callbackUrl=/mods', request.url));
    }
    
    const user = userData.user;
    
    // Log user information for debugging authentication sources
    console.log('User authenticated:', {
      id: user.id,
      email: user.email,
      provider: user.app_metadata?.provider,
      providers: user.app_metadata?.providers
    });
    
    // Verify the user has purchased this mod
    const modId = params.modId;
    const hasPurchased = await hasUserPurchasedMod(user.id, modId);
    
    if (!hasPurchased) {
      console.log(`User ${user.id} attempted to download mod ${modId} without purchase`);
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
        details: error.message
      }, { status: 500 });
    }
    
    if (!data || !data.signedUrl) {
      console.error('No signed URL was generated');
      return NextResponse.json({ 
        error: 'Failed to generate download link',
        details: 'No signed URL returned'
      }, { status: 500 });
    }
    
    // Get client IP address
    const ipAddress = request.headers.get('x-forwarded-for') || '';
    const userAgent = request.headers.get('user-agent') || '';
    
    // Log the download with all user information for tracking
    await logModDownload(
      user.id,
      modId,
      user.user_metadata,
      user.app_metadata,
      ipAddress,
      userAgent
    );
    
    // Log basic info to console as well
    console.log(`User ${user.id} downloading mod ${modId}`);
    
    // Log authentication details for debugging
    const steamId = user.user_metadata?.steamId;
    if (steamId) {
      console.log(`Steam ID: ${steamId}, Username: ${user.user_metadata?.steamUsername || 'unknown'}`);
    }
    
    const providers = user.app_metadata?.providers || [user.app_metadata?.provider].filter(Boolean);
    if (providers?.includes('discord')) {
      console.log(`Discord auth used for download of ${modId}`);
    }
    
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