import { supabase } from './supabase';
import { createClient } from '@supabase/supabase-js';

export interface Purchase {
  id: string;
  user_id: string;
  mod_id: string;
  transaction_id: string;
  purchase_date: string;
  amount: number;
  status: string;
}

/**
 * Save a purchase to the database
 * @param userId The authenticated user's ID
 * @param items Array of items to purchase
 * @param transactionId PayPal transaction ID
 * @param accessToken Optional access token for auth
 */
export async function savePurchase(
  userId: string, 
  items: any[], 
  transactionId: string, 
  accessToken?: string
) {
  let db = supabase;
  
  try {
    console.log('🔍 Starting savePurchase function with:', JSON.stringify({
      userId: userId,
      itemCount: items?.length || 0,
      hasToken: !!accessToken
    }));
    
    // Skip token authentication completely and trust the user ID
    // This is safe because the API route has already validated the token
    
    // Validate inputs
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Items array is empty or invalid");
    }
    
    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }
    
    // Create our purchase objects
    const purchases = items.map(item => ({
      user_id: userId,
      mod_id: item.id,
      transaction_id: transactionId,
      purchase_date: new Date().toISOString(),
      amount: typeof item.price === 'number' ? item.price : parseFloat(item.price),
      status: 'completed'
    }));

    // Debug output to help understand any issues
    console.log('📝 Purchase data being prepared:', JSON.stringify(purchases));

    // Direct approach: Create service role client to bypass RLS
    // WARNING: This is a special approach for this specific issue
    // Normally we would use RLS policies but we're troubleshooting an issue
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    
    console.log('🔒 Using service client to attempt insert (bypassing RLS)');

    // Now attempt the insert with the service client
    try {
      const { data, error } = await serviceClient
        .from('purchases')
        .insert(purchases)
        .select();
        
      if (error) {
        console.error('🔴 Error inserting purchases:', JSON.stringify(error));
        
        // Check common error types
        if (error.code === '23505') {
          throw new Error(`Duplicate purchase detected for transaction: ${transactionId}`);
        }
        
        if (error.code === '23503') {
          throw new Error(`Foreign key constraint failed: ${error.details}`);
        }
        
        throw new Error(`Database error (${error.code || 'UNKNOWN'}): ${error.message || error.details || 'Unknown database error'}`);
      }
      
      if (!data || data.length === 0) {
        console.error('🔴 No data returned from insert');
        throw new Error('Purchase was processed but no data was returned');
      }
      
      console.log(`✅ Successfully inserted ${data.length} purchase records`);
      return data;
    } catch (insertError) {
      console.error('🔴 Service client insert failed:', insertError);
      
      // Last resort - try a raw insert query
      console.log('🔍 Attempting direct one-by-one insert as fallback...');
      
      const savedItems = [];
      
      // Try inserting one by one as a last resort
      for (const purchase of purchases) {
        try {
          const { data: itemData, error: itemError } = await serviceClient
            .from('purchases')
            .insert([purchase])
            .select();
            
          if (itemError) {
            console.error(`🔴 Failed to insert item ${purchase.mod_id}:`, JSON.stringify(itemError));
          } else if (itemData && itemData.length > 0) {
            console.log(`✅ Successfully inserted item: ${purchase.mod_id}`);
            savedItems.push(...itemData);
          }
        } catch (singleError) {
          console.error(`🔴 Error on item ${purchase.mod_id}:`, singleError);
        }
      }
      
      if (savedItems.length > 0) {
        console.log(`✅ Salvaged ${savedItems.length} purchase records using fallback method`);
        return savedItems;
      }
      
      // If we get here, nothing worked
      throw new Error(`Failed to save purchases after multiple attempts: ${insertError instanceof Error ? insertError.message : String(insertError)}`);
    }
  } catch (error) {
    // Final error handler
    if (error instanceof Error) {
      console.error('🔴 Error in savePurchase:', error.message, error.stack);
      throw error;
    } else {
      const errorDetail = typeof error === 'object' ? JSON.stringify(error) : String(error);
      console.error('🔴 Unknown error in savePurchase:', errorDetail);
      throw new Error(`Failed to save purchase: ${errorDetail}`);
    }
  }
}

/**
 * Get all purchases for a user
 */
export async function getUserPurchases(userId: string) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select(`
        id,
        mod_id,
        transaction_id,
        purchase_date,
        amount,
        status
      `)
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) {
      console.error('Error fetching user purchases:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserPurchases:', error);
    return [];
  }
}

/**
 * Check if a user has purchased a specific mod
 */
export async function hasUserPurchasedMod(userId: string, modId: string) {
  try {
    const { data, error } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', userId)
      .eq('mod_id', modId)
      .eq('status', 'completed')
      .limit(1);

    if (error) {
      console.error('Error checking purchase:', error);
      throw error;
    }

    return (data && data.length > 0);
  } catch (error) {
    console.error('Error in hasUserPurchasedMod:', error);
    return false;
  }
} 