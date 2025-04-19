"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from "next/link";
import Image from "next/image";

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [steamLinked, setSteamLinked] = useState(false);
  const [steamUsername, setSteamUsername] = useState<string | null>(null);
  const [steamAvatar, setSteamAvatar] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Handle query parameters (success/error messages)
  const steamSuccess = searchParams.get('steam') === 'linked';
  const steamError = searchParams.get('error');
  const steamPending = searchParams.get('steamPending');
  const pendingSteamUsername = searchParams.get('steamUsername');
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.push('/');
        return;
      }
      
      setUser(session.user);
      
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
    };
    
    getUser();
  }, [router, searchParams, steamPending, pendingSteamUsername]);
  
  const handleSteamLink = () => {
    router.push('/api/auth/steam');
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
          
          <div>
            <h2 className="text-xl font-semibold">
              {user?.user_metadata?.full_name || user?.email || 'User'}
            </h2>
            <p className="text-gray-400">{user?.email}</p>
          </div>
        </div>
      </div>
      
      {/* Connected accounts */}
      <h2 className="text-xl font-semibold mb-4">Connected Accounts</h2>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        {/* Discord (should always be connected) */}
        <div className="flex items-center justify-between mb-4 p-2 bg-gray-700 rounded">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 flex items-center justify-center bg-[#5865F2] rounded-full">
              <span>D</span>
            </div>
            <span>Discord</span>
          </div>
          <span className="text-green-500">Connected</span>
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
    </div>
  );
} 