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
 * Save a purchase to the database with simplified approach
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
  try {
    console.log('🔍 Starting savePurchase function with:', {
      userId,
      itemCount: items?.length || 0,
      hasToken: !!accessToken
    });
    
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
    
    // Create a basic service client with admin privileges
    const serviceClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      serviceRoleKey
    );
    
    // Simplest approach - create purchase objects
    const purchases = items.map(item => {
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
    
    console.log('📝 Inserting purchases:', purchases);
    
    // Simple insert with basic error handling
    const { data, error } = await serviceClient
      .from('purchases')
      .insert(purchases)
      .select();
      
    if (error) {
      // Log the complete error object for debugging
      console.error('🔴 Database error:', error);
      throw new Error(`Database error: ${error.message || JSON.stringify(error)}`);
    }
    
    console.log('✅ Successfully saved purchases:', data);
    return data || [];
  } catch (error) {
    console.error('🔴 Error in savePurchase:', error);
    throw error;
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