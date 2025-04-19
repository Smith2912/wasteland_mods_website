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
    const purchases = items.map(item => ({
      user_id: userId,
      mod_id: item.id,
      transaction_id: transactionId,
      purchase_date: new Date().toISOString(),
      amount: item.price,
      status: 'completed'
    }));

    const { data, error } = await supabase
      .from('purchases')
      .insert(purchases)
      .select();

    if (error) {
      console.error('Error saving purchase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in savePurchase:', error);
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