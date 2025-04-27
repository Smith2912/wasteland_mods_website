"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { 
  createClientComponentClient, 
  Session 
} from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { CartProvider } from './context/CartContext';
import { Toaster } from 'react-hot-toast';

type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);

export function Providers({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    // Function to get and set the session
    const initializeAuth = async () => {
      try {
        // Get the initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (initialSession) {
          console.log('Initial session found:', initialSession.user.id);
          setSession(initialSession);
        } else {
          console.log('No initial session found');
          setSession(null);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize auth on component mount
    initializeAuth();

    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log('Auth state changed:', event, currentSession?.user?.id);
      
      // Update session state
      setSession(currentSession);
      
      // If we just signed in, refresh the page to update server components
      if (event === 'SIGNED_IN') {
        console.log('User signed in, refreshing router');
        router.refresh();
      }
      
      // If we just signed out, refresh the page to update server components
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, refreshing router');
        router.refresh();
      }
    });

    // Clean up the subscription when the component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <AuthContext.Provider value={{ session, isLoading }}>
      <CartProvider>
        <Toaster position="bottom-right" />
        {children}
      </CartProvider>
    </AuthContext.Provider>
  );
} 