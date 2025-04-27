"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import Link from "next/link";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AuthButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const supabase = createClientComponentClient();

  const getUser = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );
    
    // Set up visibility change listener to refresh auth state
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Don't show loading indicator for visibility-triggered refreshes
        getUser(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [supabase, getUser]);

  const handleSignIn = async () => {
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setDropdownOpen(false);
      setUser(null);
      router.push('/');
      // Force a page refresh to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <button 
        className="bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-md text-white transition-colors"
        disabled
      >
        <span className="animate-pulse">Loading...</span>
      </button>
    );
  }

  if (user) {
    return (
      <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)} 
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors"
        >
          {user.user_metadata?.avatar_url && (
            <Image 
              src={user.user_metadata.avatar_url}
              alt="Profile" 
              className="w-6 h-6 rounded-full"
              width={24}
              height={24}
            />
          )}
          {user.user_metadata?.full_name || user.email || 'User'}
        </button>
        
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-zinc-800 ring-1 ring-black ring-opacity-5 z-50">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <Link href="/account" className="block px-4 py-2 text-sm text-white hover:bg-zinc-700">
                Account
              </Link>
              <Link href="/mods" className="block px-4 py-2 text-sm text-white hover:bg-zinc-700">
                My Mods
              </Link>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-700"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="px-4 py-2 rounded-md bg-[#5865F2] hover:bg-[#4752c4] transition-colors"
    >
      Sign in with Discord
    </button>
  );
} 