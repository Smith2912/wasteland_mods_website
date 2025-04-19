import { NextRequest, NextResponse } from 'next/server';
import { savePurchase } from '@/app/lib/db';
import { createClient } from '@supabase/supabase-js';

// Create a direct Supabase client without the cookie middleware
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Get the session from Authorization header
    let session;
    let accessToken;
    
    // Get from Authorization header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid Authorization header found');
      return NextResponse.json(
        { error: 'Authentication required - Invalid or missing Authorization header' },
        { status: 401 }
      );
    }

    // Extract the token
    accessToken = authHeader.substring(7);
    console.log('Auth token received:', accessToken ? 'Valid token present' : 'No token');
    
    // Validate the token
    try {
      const { data, error } = await supabase.auth.getUser(accessToken);
      
      if (error) {
        console.error('Error validating token:', error.message);
        return NextResponse.json(
          { error: `Authentication failed: ${error.message}` },
          { status: 401 }
        );
      }
      
      if (!data?.user) {
        console.error('No user found in token');
        return NextResponse.json(
          { error: 'Authentication failed: Invalid user token' },
          { status: 401 }
        );
      }
      
      // Valid user found
      session = { user: data.user };
      console.log('Authenticated via token:', data.user.id);
      
    } catch (error) {
      console.error('Error processing auth token:', error);
      return NextResponse.json(
        { error: 'Authentication failed: Could not validate token' },
        { status: 401 }
      );
    }
    
    // Get request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.error('Failed to parse request body:', e);
      return NextResponse.json(
        { error: 'Invalid request: could not parse JSON body' },
        { status: 400 }
      );
    }
    
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
    
    console.log('Processing purchase for user:', session.user.id, 'with transaction:', transactionId);
    
    // Validate items format
    const validItems = items.every(item => 
      item && 
      typeof item === 'object' && 
      'id' in item && 
      'price' in item &&
      typeof item.id === 'string' && 
      typeof item.price === 'number'
    );
    
    if (!validItems) {
      return NextResponse.json(
        { error: 'Items must have valid id and price properties' },
        { status: 400 }
      );
    }
    
    // Save the purchase to the database
    try {
      // Pass the token to the savePurchase function
      const savedPurchase = await savePurchase(
        session.user.id,
        items,
        transactionId,
        accessToken
      );
      
      return NextResponse.json({
        success: true,
        purchases: savedPurchase
      });
    } catch (dbError) {
      console.error('Database error during checkout:', 
        dbError instanceof Error ? dbError.message : JSON.stringify(dbError)
      );
      
      // Format a user-friendly error
      const errorMessage = dbError instanceof Error 
        ? dbError.message 
        : 'Database error while saving purchase';
        
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    // Detailed error logging
    const errorDetails = error instanceof Error 
      ? { message: error.message, stack: error.stack }
      : { raw: typeof error === 'object' ? JSON.stringify(error) : String(error) };
      
    console.error('Error processing checkout:', errorDetails);
    
    // User-friendly error response
    const errorMessage = error instanceof Error 
      ? error.message 
      : typeof error === 'object' 
        ? JSON.stringify(error) 
        : String(error) || 'Unknown error';
        
    return NextResponse.json(
      { error: `Failed to process checkout: ${errorMessage}` },
      { status: 500 }
    );
  }
} 