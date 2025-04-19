import { NextRequest, NextResponse } from 'next/server';
import { savePurchase } from '@/app/lib/db';
import { createClient } from '@supabase/supabase-js';

// Create a simple Supabase client for auth only
const authClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(request: NextRequest) {
  try {
    // Get the auth token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('No valid Authorization header found');
      return NextResponse.json(
        { error: 'Authentication required - Invalid or missing Authorization header' },
        { status: 401 }
      );
    }

    // Extract token
    const accessToken = authHeader.substring(7);
    console.log('Auth token received and will be validated');
    
    // Just validate the user, don't try to maintain the session
    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);
    
    if (userError || !userData?.user) {
      console.error('Error validating user:', userError || 'No user data returned');
      return NextResponse.json(
        { error: 'Authentication failed: Invalid user credentials' },
        { status: 401 }
      );
    }
    
    // User is valid - get their ID
    const userId = userData.user.id;
    console.log('User authentication successful, ID:', userId);
    
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
    
    console.log('Processing purchase for user:', userId, 'with transaction:', transactionId);
    
    // Validate items format
    const validItems = items.every(item => 
      item && 
      typeof item === 'object' && 
      'id' in item && 
      'price' in item &&
      typeof item.id === 'string'
    );
    
    if (!validItems) {
      return NextResponse.json(
        { error: 'Items must have valid id and price properties' },
        { status: 400 }
      );
    }
    
    // Log transaction details for debugging
    console.log('Transaction details:', JSON.stringify({
      userId,
      itemCount: items.length,
      transactionId,
      orderDetails: body.orderDetails || {}
    }));
    
    // Save the purchase to the database - no need to pass token anymore
    try {
      const savedPurchase = await savePurchase(
        userId,
        items,
        transactionId
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