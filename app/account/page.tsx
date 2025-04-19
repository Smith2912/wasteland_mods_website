"use client";

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";

// Function to verify and debug authentication providers
async function debugAuthProviders(userId: string) {
  try {
    console.log('🔍 Checking auth providers for user:', userId);
    
    // This directly queries the auth.users table to verify the user exists
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('❌ Error querying user data:', userError);
      
      // Fallback to checking user identities instead
      const { data: identities, error: identityError } = await supabase
        .from('auth.identities')
        .select('*')
        .eq('user_id', userId);
      
      if (identityError) {
        console.error('❌ Error querying identity data:', identityError);
      } else {
        console.log('✅ User identities found:', identities);
      }
    } else {
      console.log('✅ User record found in database:', userData);
    }
    
    // Check for user purchases
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', userId);
    
    if (purchasesError) {
      console.error('❌ Error querying user purchases:', purchasesError);
    } else {
      console.log(`✅ User has ${purchases?.length || 0} purchases:`, purchases);
    }
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error in debugAuthProviders:', error);
    return { success: false, error };
  }
}

// Helper to call the auth verify API endpoint
async function verifyAuthStatus() {
  try {
    const response = await fetch('/api/auth/verify');
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to verify auth status:', error);
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Separate component that uses useSearchParams
function AccountContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [steamLinked, setSteamLinked] = useState(false);
  const [steamUsername, setSteamUsername] = useState<string | null>(null);
  const [steamAvatar, setSteamAvatar] = useState<string | null>(null);
  const [authProviders, setAuthProviders] = useState<string[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [verifyInfo, setVerifyInfo] = useState<any>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Handle query parameters (success/error messages)
  const steamSuccess = searchParams.get('steam') === 'linked';
  const steamError = searchParams.get('error');
  const steamPending = searchParams.get('steamPending');
  const pendingSteamUsername = searchParams.get('steamUsername');
  
  useEffect(() => {
    const getUser = async () => {
      try {
        console.log('🔄 Fetching user session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          return;
        }
        
        if (!session?.user) {
          console.log('⚠️ No active session, redirecting...');
          router.push('/auth/signin');
          return;
        }
        
        console.log('✅ User session found:', {
          id: session.user.id,
          email: session.user.email,
          providers: session.user.app_metadata?.providers,
          hasDiscord: session.user.app_metadata?.provider === 'discord' || (session.user.app_metadata?.providers || []).includes('discord'),
          hasSteam: !!session.user.user_metadata?.steamId
        });
        
        setUser(session.user);
        
        // Track authentication providers
        const providers = session.user.app_metadata?.providers || [];
        if (session.user.app_metadata?.provider && !providers.includes(session.user.app_metadata.provider)) {
          providers.push(session.user.app_metadata.provider);
        }
        setAuthProviders(providers);
        
        // Check if user has Steam linked
        const steamId = session.user.user_metadata?.steamId;
        if (steamId) {
          setSteamLinked(true);
          setSteamUsername(session.user.user_metadata.steamUsername || null);
          setSteamAvatar(session.user.user_metadata.steamAvatar || null);
        }
        
        // If there's a pending Steam account to link and the user is logged in
        if (steamPending && session.user) {
          // Link the Steam account
          const { error } = await supabase.auth.updateUser({
            data: { 
              steamId: steamPending,
              steamUsername: pendingSteamUsername || 'Steam User'
            }
          });
          
          if (!error) {
            setSteamLinked(true);
            setSteamUsername(pendingSteamUsername);
            // Remove the query parameters by redirecting
            router.push('/account?steam=linked');
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('❌ Error in getUser:', error);
        setLoading(false);
      }
    };
    
    getUser();
  }, [router, searchParams, steamPending, pendingSteamUsername]);
  
  const handleSteamLink = () => {
    router.push('/api/auth/steam');
  };
  
  const handleVerifyAuth = async () => {
    setVerifyLoading(true);
    try {
      const result = await verifyAuthStatus();
      setVerifyInfo(result);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerifyInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setVerifyLoading(false);
    }
  };
  
  const toggleDebugMode = async () => {
    setDebugMode(!debugMode);
    if (!debugMode && user) {
      const result = await debugAuthProviders(user.id);
      setDebugInfo(result);
    }
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <div className="animate-pulse">Loading account information...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      
      {/* Success/Error messages */}
      {steamSuccess && (
        <div className="bg-green-500 text-white p-4 mb-4 rounded">
          Steam account successfully linked!
        </div>
      )}
      
      {steamError && (
        <div className="bg-red-500 text-white p-4 mb-4 rounded">
          Error: {steamError.replace(/_/g, ' ')}
        </div>
      )}
      
      {/* User info */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <div className="flex items-center space-x-4 mb-4">
          {user?.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url} 
              alt="Profile" 
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center text-xl">
              {user?.email?.[0].toUpperCase() || '?'}
            </div>
          )}
          
          <div className="flex-1">
            <h2 className="text-xl font-semibold">
              {user?.user_metadata?.full_name || user?.email || 'User'}
            </h2>
            <p className="text-gray-400">{user?.email}</p>
            <p className="text-xs text-gray-500 mt-1">ID: {user?.id}</p>
          </div>
          
          <button
            onClick={handleSignOut}
            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Connected accounts */}
      <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        {/* Discord account */}
        <div className="flex items-center justify-between mb-4 p-2 bg-gray-700 rounded">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center bg-[#5865F2] rounded-full">
              <span>D</span>
            </div>
            <span>Discord</span>
          </div>
          
          {authProviders.includes('discord') ? (
            <div className="flex items-center space-x-2">
              {user?.user_metadata?.avatar_url && user?.user_metadata?.provider === 'discord' && (
                <img src={user.user_metadata.avatar_url} alt="Discord" className="w-6 h-6 rounded-full" />
              )}
              <span className="text-green-500">
                {user?.user_metadata?.provider === 'discord' && user?.user_metadata?.full_name ? 
                  user.user_metadata.full_name : 'Connected'}
              </span>
            </div>
          ) : (
            <button
              onClick={() => supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: { redirectTo: `${window.location.origin}/auth/callback` }
              })}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              Connect
            </button>
          )}
        </div>
        
        {/* Steam account */}
        <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center bg-[#231f20] rounded-full">
              <span>S</span>
            </div>
            <span>Steam</span>
          </div>
          
          {steamLinked ? (
            <div className="flex items-center space-x-2">
              {steamAvatar && (
                <img src={steamAvatar} alt="Steam" className="w-6 h-6 rounded-full" />
              )}
              <span className="text-green-500">{steamUsername || 'Connected'}</span>
            </div>
          ) : (
            <button
              onClick={handleSteamLink}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              Connect
            </button>
          )}
        </div>
      </div>
      
      {/* Purchases */}
      <h2 className="text-xl font-semibold mb-4">My Purchases</h2>
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <Link href="/mods" className="text-blue-400 hover:underline">
          View purchased mods →
        </Link>
      </div>
      
      {/* Debug section */}
      <div className="mt-8 pt-4 border-t border-gray-700">
        <div className="flex space-x-4">
          <button 
            onClick={toggleDebugMode}
            className="text-xs text-gray-500 hover:text-gray-400"
          >
            {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
          </button>
          
          <button 
            onClick={handleVerifyAuth}
            disabled={verifyLoading}
            className="text-xs text-blue-500 hover:text-blue-400 disabled:text-gray-600"
          >
            {verifyLoading ? 'Checking...' : 'Verify Auth Status (API)'}
          </button>
        </div>
        
        {debugMode && (
          <div className="mt-2 p-4 bg-gray-900 rounded text-xs font-mono whitespace-pre-wrap overflow-auto max-h-96">
            <h3 className="text-gray-400 mb-2">User Data:</h3>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            
            <h3 className="text-gray-400 mt-4 mb-2">Auth Providers:</h3>
            <pre>{JSON.stringify(authProviders, null, 2)}</pre>
            
            <h3 className="text-gray-400 mt-4 mb-2">Database Check:</h3>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            
            {verifyInfo && (
              <>
                <h3 className="text-gray-400 mt-4 mb-2">API Verification:</h3>
                <pre>{JSON.stringify(verifyInfo, null, 2)}</pre>
              </>
            )}
            
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => debugAuthProviders(user?.id || '')}
                className="bg-blue-800 text-white px-2 py-1 text-xs rounded"
              >
                Refresh Debug Data
              </button>
              
              <button
                onClick={handleVerifyAuth}
                disabled={verifyLoading}
                className="bg-green-800 text-white px-2 py-1 text-xs rounded disabled:bg-gray-700"
              >
                {verifyLoading ? 'Checking...' : 'Verify API'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Loading fallback component
function AccountLoading() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Account</h1>
      <div className="animate-pulse">Loading account information...</div>
    </div>
  );
}

// Main component with Suspense boundary
export default function AccountPage() {
  return (
    <Suspense fallback={<AccountLoading />}>
      <AccountContent />
    </Suspense>
  );
} 