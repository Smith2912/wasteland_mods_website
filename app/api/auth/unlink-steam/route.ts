import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    // Get the authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Unauthorized: Invalid authorization header' 
      }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    // Create a client with the access token already set
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    // Verify the user first
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error('Error verifying user:', userError);
      return NextResponse.json({ 
        error: 'Authentication failed' 
      }, { status: 401 });
    }
    
    // Update user metadata to remove Steam info using the authorized client
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        steamId: null,
        steamUsername: null
      }
    });
    
    if (updateError) {
      console.error('Error unlinking Steam account:', updateError);
      return NextResponse.json({ 
        error: 'Failed to unlink Steam account',
        details: updateError.message 
      }, { status: 500 });
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true,
      message: 'Steam account unlinked successfully' 
    });
    
  } catch (error) {
    console.error('Unexpected error in unlink-steam endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 