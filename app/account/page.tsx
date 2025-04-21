"use client";

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

// Separate component that uses useSearchParams
function AccountContent() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Connection states
  const [steamLinked, setSteamLinked] = useState(false);
  const [steamUsername, setSteamUsername] = useState<string | null>(null);
  const [discordLinked, setDiscordLinked] = useState(false);
  const [discordUsername, setDiscordUsername] = useState<string | null>(null);
  
  // Action states
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  
  // Debug states
  const [debugMode, setDebugMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  
  // Handle query parameters
  const steamSuccess = searchParams.get('steam') === 'linked';
  const steamError = searchParams.get('error');
  
  useEffect(() => {
    // Function to load user data and connections
    async function loadUserData() {
      try {
        setLoading(true);
        setAuthError(null);
        
        // First, get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error.message);
          setAuthError(error.message);
          setLoading(false);
          return;
        }
        
        if (!session) {
          console.log("No active session found");
          setSession(null);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // We have a session, set it
        setSession(session);
        setUser(session.user);
        
        console.log("User authenticated:", session.user?.id);
        
        // Check Discord connection
        const isDiscordLinked = 
          session.user?.identities?.some(id => id.provider === 'discord') ||
          session.user?.app_metadata?.provider === 'discord';
        
        setDiscordLinked(isDiscordLinked);
        setDiscordUsername(
          session.user?.user_metadata?.discord_username || 
          (isDiscordLinked ? session.user?.user_metadata?.full_name : null)
        );
        
        // Check Steam connection
        const steamId = session.user?.user_metadata?.steamId;
        setSteamLinked(!!steamId);
        setSteamUsername(session.user?.user_metadata?.steamUsername || null);
        
        // Load debugging data if in debug mode
        if (debugMode) {
          await refreshDebugData();
        }
      } catch (err) {
        console.error("Error loading user data:", err);
        setAuthError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    
    loadUserData();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state change:", event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          setSteamLinked(false);
          setDiscordLinked(false);
          router.push('/');
          return;
        }
        
        if (newSession) {
          setUser(newSession.user);
          setSession(newSession);
          
          // If the user just signed in or the session was updated, refresh the data
          if (['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED'].includes(event)) {
            await loadUserData();
          }
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router, debugMode]);
  
  // Function to refresh debug data
  async function refreshDebugData() {
    if (!session?.user?.id) return;
    
    try {
      // Get user details
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      // Get user purchases
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', session.user.id);
      
      setDebugInfo({
        userDetails: userData?.user || null,
        userError: userError?.message || null,
        providers: userData?.user?.identities?.map(id => id.provider) || [],
        purchases: purchases || [],
        purchasesError: purchasesError?.message || null,
        session: {
          expires_at: session.expires_at,
          token_type: session.token_type,
          has_access_token: !!session.access_token
        }
      });
    } catch (err) {
      console.error("Debug data error:", err);
      setDebugInfo({ error: err instanceof Error ? err.message : "Unknown error" });
    }
  }
  
  // Function to handle signing out
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push('/');
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    }
  };
  
  // Function to handle Steam unlinking
  const handleSteamUnlink = async () => {
    try {
      setUnlinkLoading(true);
      
      const { error } = await supabase.auth.updateUser({
        data: { 
          steamId: null,
          steamUsername: null,
          steamAvatar: null
        }
      });
      
      if (error) throw error;
      
      toast.success("Steam account unlinked successfully");
      setSteamLinked(false);
      setSteamUsername(null);
      
      // Refresh session to update user metadata
      await supabase.auth.refreshSession();
    } catch (error) {
      console.error("Steam unlink error:", error);
      toast.error("Failed to unlink Steam account");
    } finally {
      setUnlinkLoading(false);
    }
  };
  
  // Function to link Steam account
  const handleSteamLink = () => {
    router.push('/api/auth/steam');
  };
  
  // Toggle debug mode
  const toggleDebugMode = async () => {
    setDebugMode(!debugMode);
    if (!debugMode && session?.user?.id) {
      await refreshDebugData();
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="h-12 w-12 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (authError) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <p className="font-semibold">Authentication Error</p>
          <p>{authError}</p>
          <button 
            onClick={() => router.push('/auth/signin?callbackUrl=/account')}
            className="mt-2 bg-white text-red-500 px-4 py-2 rounded-md font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  // If not authenticated, show sign in prompt
  if (!user || !session) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Account</h1>
        <div className="bg-gray-800 p-6 rounded-lg text-center">
          <h2 className="text-xl mb-4">Please sign in to view your account</h2>
          <button 
            onClick={() => router.push('/auth/signin?callbackUrl=/account')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }
  
  // Show account page for authenticated users
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
          Error: {decodeURIComponent(steamError).replace(/_/g, ' ')}
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
              {user?.email ? user.email[0].toUpperCase() : '?'}
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
            <Image 
              src="/DiscordLogo.png" 
              alt="Discord Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8 rounded-full"
            />
            <span>Discord</span>
          </div>
          
          {discordLinked ? (
            <div className="flex items-center space-x-2">
              {user?.user_metadata?.avatar_url && discordLinked && (
                <img src={user.user_metadata.avatar_url} alt="Discord" className="w-6 h-6 rounded-full" />
              )}
              <span className="text-green-500">
                {discordUsername || 'Connected'}
              </span>
            </div>
          ) : (
            <span className="text-gray-400">Not connected</span>
          )}
        </div>
        
        {/* Steam account */}
        <div className="flex items-center justify-between p-2 bg-gray-700 rounded">
          <div className="flex items-center space-x-2">
            <Image 
              src="/SteamLogo.png" 
              alt="Steam Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8 rounded-full"
            />
            <span>Steam</span>
          </div>
          
          {steamLinked ? (
            <div className="flex items-center justify-end space-x-4">
              <span className="text-green-500">{steamUsername || 'Connected'}</span>
              <button
                className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                onClick={handleSteamUnlink}
                disabled={unlinkLoading}
              >
                {unlinkLoading ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-1"></span>
                    <span>Unlinking...</span>
                  </span>
                ) : 'Unlink'}
              </button>
            </div>
          ) : (
            <button
              onClick={handleSteamLink}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
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
        <button 
          onClick={toggleDebugMode}
          className="text-xs text-gray-500 hover:text-gray-400"
        >
          {debugMode ? 'Hide Debug Info' : 'Show Debug Info'}
        </button>
        
        {debugMode && debugInfo && (
          <div className="mt-2 p-4 bg-gray-900 rounded text-xs font-mono whitespace-pre-wrap overflow-auto max-h-96">
            <h3 className="text-gray-400 mb-2">Session:</h3>
            <pre>{JSON.stringify(debugInfo.session, null, 2)}</pre>
            
            <h3 className="text-gray-400 mt-4 mb-2">User Data:</h3>
            <pre>{JSON.stringify(debugInfo.userDetails, null, 2)}</pre>
            
            <h3 className="text-gray-400 mt-4 mb-2">Auth Providers:</h3>
            <pre>{JSON.stringify(debugInfo.providers, null, 2)}</pre>
            
            <h3 className="text-gray-400 mt-4 mb-2">Purchases:</h3>
            <pre>{JSON.stringify(debugInfo.purchases, null, 2)}</pre>
            
            <div className="mt-4">
              <button
                onClick={refreshDebugData}
                className="bg-blue-800 text-white px-2 py-1 text-xs rounded"
              >
                Refresh Debug Data
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