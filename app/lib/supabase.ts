import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Get environment variables with fallbacks to prevent runtime errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required Supabase environment variables');
}

// Create a singleton client for server-side usage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Global variable to store the browser client instance
// @ts-ignore - This is intentional for global use
let globalBrowserClient: any = null;

/**
 * Returns a singleton Supabase client for client-side components
 * This ensures only one GoTrueClient instance exists per browser context
 */
export const createBrowserClient = () => {
  // Check for global singleton first (for non-module contexts)
  // @ts-ignore - This is intentional for global use
  if (typeof window !== 'undefined' && window.__SUPABASE_CLIENT) {
    // @ts-ignore - This is intentional for global use
    return window.__SUPABASE_CLIENT;
  }

  // For module context, use the module-scoped singleton
  if (typeof window !== 'undefined') {
    if (!globalBrowserClient) {
      globalBrowserClient = createClientComponentClient();
      
      // Also store on window for absolute certainty of a single instance
      // @ts-ignore - This is intentional for global use
      window.__SUPABASE_CLIENT = globalBrowserClient;
    }
    return globalBrowserClient;
  }
  
  // Server-side rendering case - create a new instance (will be discarded)
  return createClientComponentClient();
};

export default supabase; 