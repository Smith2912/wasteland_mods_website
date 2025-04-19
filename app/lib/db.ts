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
      transactionId,
      firstItem: items.length > 0 ? {
        id: items[0].id,
        price: items[0].price,
        title: items[0].title || 'N/A'
      } : null
    }));

    // Debug the exact data we're sending to the database
    console.log('Purchase data being inserted:', JSON.stringify(purchases));

    // Verify the user is authenticated
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', JSON.stringify(authError));
      throw new Error(`Authentication failed: ${authError.message}`);
    }
    
    if (!authData?.user) {
      throw new Error('User not authenticated');
    }
    
    // Check if the authenticated user matches the provided userId
    if (authData.user.id !== userId) {
      console.error(`User ID mismatch: provided=${userId}, authenticated=${authData.user.id}`);
      throw new Error('User ID mismatch - cannot save purchase for another user');
    }

    // Now attempt the insert with a single purchase at a time to isolate issues
    let savedData = [];
    
    for (const purchase of purchases) {
      const { data, error } = await supabase
        .from('purchases')
        .insert([purchase])
        .select();

      if (error) {
        // Convert Supabase error to a more descriptive error
        console.error('Error saving purchase item:', JSON.stringify(error));
        
        // Check for specific error types
        if (error.code === '23505') {
          throw new Error(`Duplicate purchase detected for transaction: ${transactionId}`);
        }
        
        if (error.code === '23503') {
          throw new Error(`Foreign key constraint failed: ${error.details || 'Check if mod_id exists and user_id references a valid user'}`);
        }
        
        if (error.code === '42P01') {
          throw new Error(`Table 'purchases' does not exist. Database schema issue.`);
        }
        
        if (error.code === '42501' || error.message?.includes('permission')) {
          throw new Error(`Permission denied: RLS policy is blocking the insert operation. Make sure you're authenticated and have the correct role.`);
        }
        
        // Test permissions with a simple select query
        const { error: selectError } = await supabase
          .from('purchases')
          .select('count(*)')
          .limit(1);
          
        if (selectError) {
          console.error('Permission test failed:', JSON.stringify(selectError));
          throw new Error(`Database access issue: ${selectError.message || 'Cannot access purchases table'}`);
        }
        
        const errorMessage = error.message || error.details || 'Database error while saving purchase';
        const errorCode = error.code || 'UNKNOWN';
        
        throw new Error(`Database error (${errorCode}): ${errorMessage}`);
      }

      if (data && data.length > 0) {
        savedData.push(...data);
      }
    }

    if (savedData.length === 0) {
      throw new Error("No purchase data was returned after insert");
    }

    return savedData;
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