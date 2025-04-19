"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// Component with search params hook
function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  const handleDiscordSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      },
    });
  };

  const handleSteamSignIn = () => {
    router.push('/api/auth/steam');
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Sign In</h1>
      
      {error && (
        <div className="bg-red-500 text-white p-4 mb-4 rounded">
          {error === "OAuthSignin" && "Error starting the sign in process."}
          {error === "OAuthCallback" && "Error during the sign in process."}
          {error === "OAuthCreateAccount" && "Error creating a new account."}
          {error === "EmailCreateAccount" && "Error creating a new account."}
          {error === "Callback" && "Error during the sign in callback."}
          {error === "Default" && "An unexpected error occurred."}
        </div>
      )}
      
      <div className="flex flex-col space-y-4">
        <button
          onClick={handleDiscordSignIn}
          className="flex items-center justify-center space-x-2 bg-[#5865F2] text-white px-4 py-3 rounded-lg hover:bg-[#4752C4] transition"
        >
          <span>Sign in with Discord</span>
        </button>
        
        <button
          onClick={handleSteamSignIn}
          className="flex items-center justify-center space-x-2 bg-[#231f20] text-white px-4 py-3 rounded-lg hover:bg-[#171717] transition"
        >
          <span>Sign in with Steam</span>
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