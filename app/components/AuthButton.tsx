"use client";

import React, { useState } from 'react';
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  if (session) {
    return (
      <div className="relative">
        <button 
          onClick={() => setDropdownOpen(!dropdownOpen)} 
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors"
        >
          {session.user?.image && (
            <img 
              src={session.user.image}
              alt="Profile" 
              className="w-6 h-6 rounded-full"
            />
          )}
          {session.user?.name || 'User'}
        </button>
        
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-zinc-800 ring-1 ring-black ring-opacity-5">
            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
              <Link href="/account" className="block px-4 py-2 text-sm text-white hover:bg-zinc-700">
                Account
              </Link>
              <Link href="/mods" className="block px-4 py-2 text-sm text-white hover:bg-zinc-700">
                My Mods
              </Link>
              <button
                onClick={() => signOut()}
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
      onClick={() => signIn('discord')}
      className="px-4 py-2 rounded-md bg-[#5865F2] hover:bg-[#4752c4] transition-colors"
    >
      Sign in with Discord
    </button>
  );
} 