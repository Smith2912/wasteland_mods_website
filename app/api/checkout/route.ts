import { NextRequest, NextResponse } from 'next/server';
import { savePurchase } from '@/app/lib/db';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client for server-side authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          async get(name) {
            const cookieStore = await cookies();
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            // We don't need to set cookies in this API route
          },
          remove(name, options) {
            // We don't need to remove cookies in this API route
          },
        },
      }
    );
    
    // Get the session from both cookies and Authorization header
    let session;
    
    // First try to get from Authorization header (preferred)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data, error } = await supabase.auth.getUser(token);
      
      if (!error && data?.user) {
        session = { user: data.user };
      } else {
        console.error('Invalid token in Authorization header:', error);
      }
    }
    
    // If no session from header, fall back to cookies
    if (!session) {
      const { data } = await supabase.auth.getSession();
      session = data.session;
    }
    
    // Check if we have a valid user
    if (!session?.user) {
      console.error('No authenticated user found for checkout');
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { items, transactionId } = body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      );
    }
    
    if (!transactionId) {
      return NextResponse.json(
        { error: 'Transaction ID is required' },
        { status: 400 }
      );
    }
    
    console.log('Processing purchase for user:', session.user.id);
    
    // Save the purchase to the database
    const savedPurchase = await savePurchase(
      session.user.id,
      items,
      transactionId
    );
    
    return NextResponse.json({
      success: true,
      purchases: savedPurchase
    });
  } catch (error) {
    console.error('Error processing checkout:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout' },
      { status: 500 }
    );
  }
} 