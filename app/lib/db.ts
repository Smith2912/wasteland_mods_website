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
 * Save a purchase to the database using the save_purchase RPC function
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
    
    // Check that we have a service role key (required for this approach)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('🔴 CRITICAL ERROR: SUPABASE_SERVICE_ROLE_KEY is missing');
      throw new Error("Server configuration error: Missing required database credentials");
    }
    
    // Create service client with admin rights
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
    
    // Given the RPC failures, let's temporarily use the direct insert method
    console.log('⚠️ Using direct insert method due to RPC issues');
    
    // Create the purchase objects
    const purchases = items.map(item => {
      // Validate each item has an id
      if (!item.id) {
        throw new Error(`Item missing required id field: ${JSON.stringify(item)}`);
      }
      
      // Ensure price is a valid number
      let price = 0;
      if (typeof item.price === 'number') {
        price = item.price;
      } else if (typeof item.price === 'string') {
        price = parseFloat(item.price);
        if (isNaN(price)) {
          throw new Error(`Invalid price format for item ${item.id}: ${item.price}`);
        }
      } else {
        throw new Error(`Missing or invalid price for item ${item.id}`);
      }
      
      return {
        user_id: userId,
        mod_id: item.id,
        transaction_id: transactionId,
        purchase_date: new Date().toISOString(),
        amount: price,
        status: 'completed'
      };
    });
    
    // Debug output to help understand any issues
    console.log('📝 Purchase data being prepared:', JSON.stringify(purchases));
    
    // Direct approach with service role client
    try {
      // Try inserting directly with all records
      console.log('🔒 Using service client to insert all records');
      const { data, error } = await serviceClient
        .from('purchases')
        .insert(purchases)
        .select();
        
      if (error) {
        console.error('🔴 Insert error:', JSON.stringify(error));
        throw new Error(`Database error (${error.code || 'UNKNOWN'}): ${error.message || error.details || JSON.stringify(error)}`);
      }
      
      console.log(`✅ Successfully inserted ${data?.length || 0} records`);
      return data || [];
    } catch (insertError) {
      console.error('🔴 Insert failed:', insertError);
      
      // Try one-by-one as last resort
      console.log('🔍 Attempting one-by-one insert as last resort...');
      
      const savedItems = [];
      let hasSucceeded = false;
      
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
            hasSucceeded = true;
          }
        } catch (singleError) {
          console.error(`🔴 Error on item ${purchase.mod_id}:`, singleError);
        }
      }
      
      if (hasSucceeded) {
        console.log(`✅ Salvaged ${savedItems.length} purchase records using fallback method`);
        return savedItems;
      }
      
      throw new Error(`Failed to save purchases after multiple attempts: ${insertError instanceof Error ? insertError.message : JSON.stringify(insertError)}`);
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