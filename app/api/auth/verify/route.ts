import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client using cookies for authentication
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
      return NextResponse.json({ 
        authenticated: false,
        message: 'No active session'
      }, { status: 401 });
    }
    
    // Create service client for administrative operations
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      return NextResponse.json({ 
        authenticated: true,
        userId: session.user.id,
        verificationStatus: 'limited',
        message: 'Service role key missing, limited verification possible',
        user: {
          id: session.user.id,
          email: session.user.email,
          provider: session.user.app_metadata.provider,
          providers: session.user.app_metadata.providers,
          steamLinked: !!session.user.user_metadata?.steamId
        }
      });
    }
    
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    
    // Call database function to verify authentication
    const { data: authData, error: authError } = await serviceClient.rpc('check_user_auth', {
      user_id: session.user.id
    });
    
    if (authError) {
      console.error('Error verifying user auth:', authError);
      return NextResponse.json({ 
        authenticated: true,
        userId: session.user.id,
        verificationStatus: 'error',
        message: 'Failed to verify provider details',
        error: authError.message,
        user: {
          id: session.user.id,
          email: session.user.email,
          provider: session.user.app_metadata.provider,
          providers: session.user.app_metadata.providers,
          steamLinked: !!session.user.user_metadata?.steamId
        }
      });
    }
    
    // Check if user has purchases
    const { data: purchases, error: purchasesError } = await serviceClient
      .from('purchases')
      .select('id, mod_id, transaction_id, purchase_date')
      .eq('user_id', session.user.id);
    
    return NextResponse.json({
      authenticated: true,
      userId: session.user.id,
      verificationStatus: 'complete',
      authProviderData: authData,
      purchases: purchasesError ? { error: purchasesError.message } : purchases,
      user: {
        id: session.user.id,
        email: session.user.email,
        provider: session.user.app_metadata.provider,
        providers: session.user.app_metadata.providers,
        steamLinked: !!session.user.user_metadata?.steamId
      }
    });
  } catch (error) {
    console.error('Unexpected error in auth verification:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 