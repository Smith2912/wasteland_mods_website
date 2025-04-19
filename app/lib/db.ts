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
    
    // Use a direct client with the access token if provided
    if (accessToken) {
      console.log('📝 Creating custom Supabase client with provided token');
      try {
        const customClient = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!, 
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: sessionData, error: sessionError } = await customClient.auth.setSession({ 
          access_token: accessToken, 
          refresh_token: '' 
        });
        
        if (sessionError) {
          console.error('🔴 Error setting session:', JSON.stringify(sessionError));
          throw new Error(`Auth session setup failed: ${sessionError.message}`);
        }
        
        console.log('✅ Custom client created with token, session established');
        db = customClient;
        
        // Verify we have a valid session
        const { data: userData, error: userError } = await db.auth.getUser();
        if (userError) {
          console.error('🔴 Token validation failed:', JSON.stringify(userError));
          throw new Error(`Token validation failed: ${userError.message}`);
        }
        
        console.log('✅ Token validated, user:', userData?.user?.id || 'Unknown');
        
        // Check if we can access the purchases table
        const { data: testData, error: testError } = await db
          .from('purchases')
          .select('id')
          .limit(1);
          
        if (testError) {
          console.error('🔴 Cannot access purchases table:', JSON.stringify(testError));
          throw new Error(`Database access test failed: ${testError.message}`);
        }
        
        console.log('✅ Successfully accessed purchases table');
      } catch (e) {
        console.error('🔴 Auth client creation error:', e);
        throw new Error(`Failed to initialize authenticated client: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      console.log('⚠️ No access token provided, using default client');
    }

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

    // Now attempt the insert - try JUST ONE record first to isolate issues
    const singlePurchase = purchases[0];
    console.log('🔍 Attempting to insert single record first:', JSON.stringify(singlePurchase));
    
    try {
      const { data: singleData, error: singleError } = await db
        .from('purchases')
        .insert([singlePurchase])
        .select();
        
      if (singleError) {
        console.error('🔴 Error inserting single purchase:', JSON.stringify(singleError));
        
        // Check common error types
        if (singleError.code === '23505') {
          throw new Error(`Duplicate purchase detected for transaction: ${transactionId}`);
        }
        
        if (singleError.code === '23503') {
          throw new Error(`Foreign key constraint failed: ${singleError.details}`);
        }
        
        if (singleError.code === '42501') {
          throw new Error(`Permission denied: RLS policy is blocking the insert operation`);
        }
        
        if (singleError.message?.includes('permission')) {
          throw new Error(`Permission denied: ${singleError.message}`);
        }
        
        throw new Error(`Database error (${singleError.code || 'UNKNOWN'}): ${singleError.message || singleError.details || 'Unknown database error'}`);
      }
      
      if (!singleData || singleData.length === 0) {
        console.error('🔴 No data returned from single insert');
        throw new Error('Purchase was processed but no data was returned');
      }
      
      console.log('✅ Single purchase record inserted successfully!');
      
      // If we made it here, let's try the rest
      let remainingData = [];
      
      if (purchases.length > 1) {
        console.log(`🔍 Now inserting remaining ${purchases.length - 1} records...`);
        
        // Assuming first item was successful, insert the rest
        const restOfPurchases = purchases.slice(1);
        
        if (restOfPurchases.length > 0) {
          const { data: restData, error: restError } = await db
            .from('purchases')
            .insert(restOfPurchases)
            .select();
            
          if (restError) {
            console.error('🔴 Error inserting remaining purchases:', JSON.stringify(restError));
            // Continue anyway since we inserted at least one record
          } else if (restData) {
            remainingData = restData;
            console.log(`✅ Successfully inserted ${restData.length} additional records`);
          }
        }
      }
      
      // Combine the results
      const allData = [...(singleData || []), ...remainingData];
      console.log(`✅ Total records inserted: ${allData.length}`);
      
      return allData;
    } catch (insertError) {
      console.error('🔴 Insert operation failed:', insertError);
      
      // Try a different approach - direct query with RPC if everything else fails
      console.log('🔍 Attempting alternative approach...');
      
      try {
        // Try a direct RPC call if defined on the server
        const { data: rpcData, error: rpcError } = await db.rpc('save_purchase', {
          p_user_id: userId,
          p_mod_id: singlePurchase.mod_id,
          p_transaction_id: transactionId,
          p_amount: singlePurchase.amount
        });
        
        if (rpcError) {
          console.error('🔴 RPC fallback failed:', JSON.stringify(rpcError));
          throw insertError; // Throw the original error
        }
        
        console.log('✅ Saved purchase via RPC fallback');
        return [{ id: rpcData, ...singlePurchase }];
      } catch (rpcFailure) {
        console.error('🔴 All approaches failed:', rpcFailure);
        throw insertError; // Throw the original error since fallback also failed
      }
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