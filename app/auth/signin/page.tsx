"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createBrowserClient } from '../../lib/supabase';

// Component with search params hook
function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    discord: false,
    steam: false
  });
  const [authError, setAuthError] = useState<string | null>(error);
  // Use useState with initializer to ensure client is created only once
  const [supabase] = useState(() => createBrowserClient());

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Current session check:', session ? 'User is authenticated' : 'No session found');
      if (session) {
        // User is already signed in, redirect to the callback url
        console.log('Redirecting to:', callbackUrl);
        router.push(callbackUrl);
      }
    };
    
    checkAuth();
  }, [callbackUrl, router, supabase]);

  const handleDiscordSignIn = async () => {
    try {
      setIsLoading({...isLoading, discord: true});
      setAuthError(null);
      
      console.log('Starting Discord sign-in process...');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          // Include the callbackUrl as a query parameter to maintain context after auth
          redirectTo: `${window.location.origin}/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl)}`,
        },
      });
      
      if (error) {
        console.error('Discord auth error:', error);
        setAuthError(error.message);
        setIsLoading({...isLoading, discord: false});
        return;
      }
      
      console.log('Discord sign-in successful, redirecting...');
      // The redirect will happen automatically from Supabase
    } catch (err) {
      console.error('Unexpected error during Discord sign-in:', err);
      setAuthError('An unexpected error occurred. Please try again.');
      setIsLoading({...isLoading, discord: false});
    }
  };

  const handleSteamSignIn = () => {
    try {
      setIsLoading({...isLoading, steam: true});
      setAuthError(null);
      console.log('Starting Steam sign-in process...');
      // Add callbackUrl to maintain context
      router.push(`/api/auth/steam?callbackUrl=${encodeURIComponent(callbackUrl)}`);
    } catch (err) {
      console.error('Unexpected error during Steam sign-in:', err);
      setAuthError('An unexpected error occurred. Please try again.');
      setIsLoading({...isLoading, steam: false});
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      
      {authError && (
        <div className="bg-red-500 text-white p-4 mb-4 rounded">
          {authError === "OAuthSignin" && "Error starting the sign in process."}
          {authError === "OAuthCallback" && "Error during the sign in process."}
          {authError === "OAuthCreateAccount" && "Error creating a new account."}
          {authError === "EmailCreateAccount" && "Error creating a new account."}
          {authError === "Callback" && "Error during the sign in callback."}
          {authError === "Default" && "An unexpected error occurred."}
          {authError && !["OAuthSignin", "OAuthCallback", "OAuthCreateAccount", "EmailCreateAccount", "Callback", "Default"].includes(authError) && authError}
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        <button
          onClick={handleDiscordSignIn}
          disabled={isLoading.discord}
          className="flex items-center justify-center space-x-2 bg-[#5865F2] text-white px-4 py-3 rounded-lg hover:bg-[#4752C4] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading.discord ? 'Connecting to Discord...' : 'Sign in with Discord'}</span>
        </button>
        
        <button
          onClick={handleSteamSignIn}
          disabled={isLoading.steam}
          className="flex items-center justify-center space-x-2 bg-[#231f20] text-white px-4 py-3 rounded-lg hover:bg-[#171717] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{isLoading.steam ? 'Connecting to Steam...' : 'Sign in with Steam'}</span>
        </button>
      </div>
    </div>
  );
}

// Loading state
function SignInLoading() {
  return (
    <div className="container mx-auto p-4 flex justify-center items-center">
      <div className="animate-pulse text-xl">Loading sign-in options...</div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SignIn() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInContent />
    </Suspense>
  );
} 