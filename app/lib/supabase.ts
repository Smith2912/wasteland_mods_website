import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Get environment variables with fallbacks to prevent runtime errors
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Validate required environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required Supabase environment variables');
}

// IMPORTANT: Only use this client for server components or API routes
// For client-side components, use createBrowserClient() instead
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// This is the preferred way to get a client instance in client components
// to avoid the "Multiple GoTrueClient instances" warning
let browserClient: ReturnType<typeof createClientComponentClient> | null = null;

export const createBrowserClient = () => {
  if (typeof window === 'undefined') {
    // We're on the server, return a new instance
    return createClientComponentClient();
  }
  
  // We're in the browser, return or create a singleton
  if (!browserClient) {
    browserClient = createClientComponentClient();
  }
  return browserClient;
};

export default supabase; 