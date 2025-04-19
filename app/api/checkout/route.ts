import { NextRequest, NextResponse } from 'next/server';
import { savePurchase } from '@/app/lib/db';
import { supabase } from '@/app/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get the client session to ensure they're logged in
    const cookieStore = cookies();
    const supabaseClient = supabase;
    
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session?.user) {
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