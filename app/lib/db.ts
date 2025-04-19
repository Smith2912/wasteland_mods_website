import { supabase } from './supabase';

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
 */
export async function savePurchase(userId: string, items: any[], transactionId: string) {
  try {
    // Validate inputs
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    if (!items || items.length === 0) {
      throw new Error("Items array is empty or invalid");
    }
    
    if (!transactionId) {
      throw new Error("Transaction ID is required");
    }
    
    const purchases = items.map(item => ({
      user_id: userId,
      mod_id: item.id,
      transaction_id: transactionId,
      purchase_date: new Date().toISOString(),
      amount: item.price,
      status: 'completed'
    }));

    // Debug output to help understand any issues
    console.log('Attempting to save purchases:', JSON.stringify({
      userId,
      itemCount: items.length,
      transactionId
    }));

    const { data, error } = await supabase
      .from('purchases')
      .insert(purchases)
      .select();

    if (error) {
      // Convert Supabase error to a more descriptive error
      console.error('Error saving purchase:', JSON.stringify(error));
      const errorMessage = error.message || error.details || 'Database error while saving purchase';
      const errorCode = error.code || 'UNKNOWN';
      
      throw new Error(`Database error (${errorCode}): ${errorMessage}`);
    }

    if (!data) {
      throw new Error("Purchase was saved but no data was returned");
    }

    return data;
  } catch (error) {
    // Ensure we always throw an Error object with a message
    if (error instanceof Error) {
      console.error('Error in savePurchase:', error.message);
      throw error;
    } else {
      const errorDetail = typeof error === 'object' ? JSON.stringify(error) : String(error);
      console.error('Error in savePurchase:', errorDetail);
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