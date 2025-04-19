'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SupabaseAuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Check for active session
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Set up listener for auth state changes
      const { data: { subscription } } = await supabase.auth.onAuthStateChange(
        (_event, session) => {
          setUser(session?.user ?? null);
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    checkUser();
  }, []);

  const handleLogin = async (provider: 'discord') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleSteamLogin = () => {
    // Steam uses OpenID which is not directly supported by Supabase
    // So we redirect to our custom Steam auth endpoint
    router.push('/api/auth/steam');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={toggleDropdown}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-700 transition"
        >
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              {user.email?.[0].toUpperCase() || '?'}
            </div>
          )}
          <span>{user.user_metadata?.full_name || user.email || 'User'}</span>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl z-10">
            <Link
              href="/account"
              className="block px-4 py-2 text-gray-200 hover:bg-gray-700"
              onClick={() => setShowDropdown(false)}
            >
              Account
            </Link>
            <Link
              href="/purchases"
              className="block px-4 py-2 text-gray-200 hover:bg-gray-700"
              onClick={() => setShowDropdown(false)}
            >
              Purchases
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-gray-200 hover:bg-gray-700"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex space-x-4">
      <button
        onClick={() => handleLogin('discord')}
        className="flex items-center space-x-2 bg-[#5865F2] text-white px-4 py-2 rounded-lg hover:bg-[#4752C4] transition"
      >
        <span>Discord Login</span>
      </button>
      <button
        onClick={handleSteamLogin}
        className="flex items-center space-x-2 bg-[#231f20] text-white px-4 py-2 rounded-lg hover:bg-[#171717] transition"
      >
        <span>Steam Login</span>
      </button>
    </div>
  );
} 