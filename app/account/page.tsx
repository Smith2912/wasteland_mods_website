"use client";

import { useEffect, useState, Suspense } from 'react';
import { supabase } from '../lib/supabase';
import { User, Session } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';

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
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [discordLinked, setDiscordLinked] = useState(false);
  const [discordUsername, setDiscordUsername] = useState<string>('');
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Handle query parameters (success/error messages)
  const steamSuccess = searchParams.get('steam') === 'linked';
  const steamError = searchParams.get('error');
  const steamPending = searchParams.get('steamPending');
  const pendingSteamUsername = searchParams.get('steamUsername');
  
  const supabase = createClientComponentClient();
  
  // Use effect to check if user is authenticated and get session
  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        setLoading(false);
        return;
      }
      
      if (currentSession) {
        setSession(currentSession);
        setIsAuthenticated(true);
        setUser(currentSession.user);
        
        // Check if user has Discord linked
        if (currentSession.user?.app_metadata?.provider === 'discord' ||
            currentSession.user?.identities?.some(identity => identity.provider === 'discord')) {
          setDiscordLinked(true);
          setDiscordUsername(currentSession.user?.user_metadata?.discord_username || '');
        }
        
        // Check if user has Steam linked via user metadata
        const steamId = currentSession.user?.user_metadata?.steamId;
        const steamUsername = currentSession.user?.user_metadata?.steamUsername;
        const steamAvatar = currentSession.user?.user_metadata?.steamAvatar;
        
        if (steamId) {
          setSteamLinked(true);
          setSteamUsername(steamUsername || '');
          setSteamAvatar(steamAvatar || '');
        }
      }
      
      setLoading(false);
    };
    
    getSession();
    
    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsAuthenticated(!!newSession);
      
      if (newSession?.user) {
        // Update Discord status
        if (newSession.user?.app_metadata?.provider === 'discord' ||
            newSession.user?.identities?.some(identity => identity.provider === 'discord')) {
          setDiscordLinked(true);
          setDiscordUsername(newSession.user?.user_metadata?.discord_username || '');
        } else {
          setDiscordLinked(false);
          setDiscordUsername('');
        }
        
        // Update Steam status
        const steamId = newSession.user?.user_metadata?.steamId;
        const steamUsername = newSession.user?.user_metadata?.steamUsername;
        const steamAvatar = newSession.user?.user_metadata?.steamAvatar;
        
        if (steamId) {
          setSteamLinked(true);
          setSteamUsername(steamUsername || '');
          setSteamAvatar(steamAvatar || '');
        } else {
          setSteamLinked(false);
          setSteamUsername('');
          setSteamAvatar('');
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);
  
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
  
  const handleSteamUnlink = async () => {
    setUnlinkLoading(true);
    
    try {
      if (!session) {
        toast.error("You must be logged in to unlink your Steam account");
        return;
      }
      
      const { error } = await supabase.auth.updateUser({
        data: { 
          steamId: null,
          steamUsername: null,
          steamAvatar: null
        }
      });
      
      if (error) {
        console.error("Error unlinking Steam account:", error);
        toast.error("Failed to unlink Steam account");
        return;
      }
      
      setSteamLinked(false);
      setSteamUsername('');
      setSteamAvatar('');
      toast.success("Steam account unlinked successfully");
    } catch (error) {
      console.error("Error unlinking Steam account:", error);
      toast.error("Failed to unlink Steam account");
    } finally {
      setUnlinkLoading(false);
    }
  };
  
  // Handle Steam unlinking alternative method
  const handleSteamUnlinkAlternative = async () => {
    try {
      setUnlinkLoading(true);
      
      if (!session || !session.user) {
        console.error("No session or user found");
        setUnlinkLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          steamId: null,
          steamUsername: null,
          steamAvatar: null
        }
      });

      if (error) {
        console.error("Error unlinking Steam account:", error);
        alert("Failed to unlink Steam account: " + error.message);
      } else {
        console.log("Successfully unlinked Steam account");
        alert("Successfully unlinked Steam account");
        
        // Refresh session
        const { data } = await supabase.auth.refreshSession();
        if (data.session) {
          setSession(data.session);
          setSteamLinked(false);
          setSteamUsername(null);
          setSteamAvatar(null);
        }
      }
    } catch (error) {
      console.error("Error in unlinking Steam account:", error);
      alert("An unexpected error occurred while unlinking your Steam account");
    } finally {
      setUnlinkLoading(false);
    }
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
            <Image 
              src="/DiscordLogo.png" 
              alt="Discord Logo" 
              width={32} 
              height={32} 
              className="w-8 h-8 rounded-full"
            />
            <span>Discord</span>
          </div>
          
          {discordLinked && (
            <div className="flex items-center space-x-2">
              {user?.user_metadata?.avatar_url && user?.user_metadata?.provider === 'discord' && (
                <img src={user.user_metadata.avatar_url} alt="Discord" className="w-6 h-6 rounded-full" />
              )}
              <span className="text-green-500">
                {user?.user_metadata?.provider === 'discord' && user?.user_metadata?.full_name ? 
                  user.user_metadata.full_name : 'Connected'}
              </span>
            </div>
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
          
          {steamLinked && steamUsername && (
            <div className="flex flex-col space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <Image 
                  src="/SteamLogo.png" 
                  alt="Steam Logo" 
                  width={32} 
                  height={32} 
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-white">{steamUsername}</span>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded"
                  onClick={handleSteamUnlink}
                  disabled={unlinkLoading}
                >
                  {unlinkLoading ? 'Unlinking...' : 'Unlink'}
                </button>
                <button
                  className="px-3 py-1 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded"
                  onClick={handleSteamUnlinkAlternative}
                  disabled={unlinkLoading}
                  title="Alternative method to unlink account"
                >
                  {unlinkLoading ? 'Unlinking...' : 'Unlink (Alt)'}
                </button>
              </div>
            </div>
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