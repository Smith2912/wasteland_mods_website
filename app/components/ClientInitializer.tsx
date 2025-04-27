"use client";

import { useEffect } from "react";
import { createBrowserClient } from "../lib/supabase";

/**
 * This component ensures that the Supabase client is initialized
 * as early as possible in the application lifecycle.
 * It doesn't render anything visible, it just initializes the client.
 */
export default function ClientInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize Supabase client at application startup
      const client = createBrowserClient();
      console.log('ClientInitializer: Supabase client initialized early');
    }
  }, []);

  // This component doesn't render anything
  return null;
} 