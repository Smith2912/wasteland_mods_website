"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import { Session } from "@supabase/supabase-js";
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

// Create a context for the Supabase session
const AuthContext = createContext<{
  session: Session | null;
  isLoading: boolean;
}>({
  session: null,
  isLoading: true,
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setIsLoading(false);
    };

    getSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      <CartProvider>
        <Toaster position="top-center" />
        {children}
      </CartProvider>
    </AuthContext.Provider>
  );
} 