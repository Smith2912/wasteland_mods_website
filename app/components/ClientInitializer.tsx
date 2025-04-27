"use client";

import { useEffect } from "react";
import { createBrowserClient } from "../lib/supabase";
import { useRouter } from 'next/navigation';
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

/**
 * This component ensures that the Supabase client is initialized
 * as early as possible in the application lifecycle.
 * It doesn't render anything visible, it just initializes the client.
 */
export default function ClientInitializer() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supabase = createBrowserClient();
      console.log('ClientInitializer: Monitoring auth state changes');
      
      // Set up a subscription to auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event: AuthChangeEvent, session: Session | null) => {
          console.log('Auth state change event:', event);
          console.log('Session present:', !!session);
          
          // Force refresh current route when auth state changes
          if (['SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED'].includes(event)) {
            router.refresh();
          }
        }
      );
      
      // Listen for storage changes (to debug auth token issues)
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key && e.key.includes('supabase')) {
          console.log('Storage changed for key:', e.key);
          console.log('Old value:', e.oldValue ? 'Present' : 'Missing');
          console.log('New value:', e.newValue ? 'Present' : 'Missing');
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      return () => {
        subscription.unsubscribe();
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [router]);

  // This component doesn't render anything
  return null;
} 