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
    
    console.log('📊 Using RPC function for reliable purchase insertion');
    
    let allResults = [];
    let errors = [];
    
    // Process each item using the database function for better reliability
    for (const item of items) {
      // Validate the item
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
      
      // Call the database function for this item
      console.log(`🔄 Processing item ${item.id} with price ${price}`);
      
      const { data, error } = await serviceClient.rpc('save_purchase', {
        p_user_id: userId,
        p_mod_id: item.id,
        p_transaction_id: transactionId,
        p_amount: price,
        p_status: 'completed'
      });
      
      if (error) {
        console.error(`🔴 Error saving item ${item.id}:`, JSON.stringify(error));
        errors.push(error);
        continue;
      }
      
      if (data && data.success) {
        console.log(`✅ Successfully saved item ${item.id}: ${data.message || 'Purchase saved'}`);
        if (data.purchase_id) {
          // Format of the result changed slightly
          allResults.push({
            id: data.purchase_id,
            user_id: userId,
            mod_id: item.id,
            transaction_id: transactionId,
            purchase_date: new Date().toISOString(),
            amount: price,
            status: 'completed'
          });
        } else if (data.purchase) {
          allResults.push(data.purchase);
        }
      } else {
        console.warn(`⚠️ Item ${item.id} saved but with warning: ${data?.message || 'Unknown result'}`);
        if (data?.purchase_id) {
          allResults.push({
            id: data.purchase_id,
            user_id: userId,
            mod_id: item.id,
            transaction_id: transactionId,
            purchase_date: new Date().toISOString(),
            amount: price,
            status: 'completed'
          });
        } else if (data?.purchase) {
          allResults.push(data.purchase);
        }
      }
    }
    
    // Check if we have at least some successes
    if (allResults.length > 0) {
      console.log(`✅ Successfully saved ${allResults.length} out of ${items.length} purchases`);
      return allResults;
    }
    
    // If no successes at all, try our fallback methods
    if (errors.length > 0) {
      // Attempt to insert using traditional method as fallback
      console.log('⚠️ RPC method failed, attempting traditional insert fallback...');
      
      // Create the purchase objects
      const purchases = items.map(item => {
        // Ensure price is a valid number
        let price = 0;
        if (typeof item.price === 'number') {
          price = item.price;
        } else if (typeof item.price === 'string') {
          price = parseFloat(item.price);
          if (isNaN(price)) {
            throw new Error(`Invalid price format for item ${item.id}: ${item.price}`);
          }
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
      
      try {
        // Try inserting directly
        const { data, error } = await serviceClient
          .from('purchases')
          .insert(purchases)
          .select();
          
        if (error) {
          throw new Error(`Database error (${error.code || 'UNKNOWN'}): ${error.message || error.details || JSON.stringify(error)}`);
        }
        
        console.log(`✅ Fallback succeeded - inserted ${data?.length || 0} records`);
        return data || [];
      } catch (fallbackError) {
        console.error('🔴 Both primary and fallback methods failed:', fallbackError);
        throw new Error(`Failed to save purchases after multiple attempts: ${errors[0]?.message || 'Database error (UNKNOWN): Unknown database error'}`);
      }
    }
    
    throw new Error('Failed to save purchases: Unknown error occurred');
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