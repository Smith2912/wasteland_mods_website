import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Extend Window interface to include our custom property
declare global {
  interface Window {
    __SUPABASE_CLIENT: any;
  }
}

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

// Singleton instance and initialization flag
let globalBrowserClient: any = null;
let isInitializing = false;

/**
 * Returns a singleton Supabase client for client-side components
 * This ensures only one GoTrueClient instance exists per browser context
 */
export const createBrowserClient = () => {
  // Server-side rendering case - create a new instance (will be discarded)
  if (typeof window === 'undefined') {
    return createClientComponentClient();
  }
  
  // Check for global singleton first (for non-module contexts)
  if (window.__SUPABASE_CLIENT) {
    return window.__SUPABASE_CLIENT;
  }
  
  // If initialization is in progress, wait for it to complete
  if (isInitializing) {
    return globalBrowserClient || createClientComponentClient();
  }
  
  try {
    isInitializing = true;
    
    // Create the singleton if it doesn't exist
    if (!globalBrowserClient) {
      globalBrowserClient = createClientComponentClient();
      
      // Store on window for absolute certainty of a single instance
      window.__SUPABASE_CLIENT = globalBrowserClient;
      
      console.log('Supabase browser client initialized as singleton');
    }
    
    return globalBrowserClient;
  } finally {
    isInitializing = false;
  }
};

export default supabase; 