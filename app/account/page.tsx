"use client";

import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    if (!loading && !session) {
      redirect("/auth/signin?callbackUrl=/account");
    }
  }, [loading, session]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto"></div>
            <h2 className="text-xl mt-4">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // This will never render because of the redirect
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Account Settings</h1>
      
      <div className="bg-zinc-800 rounded-lg p-6 mb-8">
        <div className="flex items-center space-x-4 mb-4">
          {session.user?.image && (
            <img 
              src={session.user.image} 
              alt={session.user?.name || "User"} 
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-bold">{session.user?.name}</h2>
            <p className="text-zinc-400">{session.user?.email}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-zinc-800 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Steam Account</h2>
            
            {session.user?.steamLinked ? (
              <div className="flex items-center space-x-4">
                {session.user.steamProfile?.avatar && (
                  <img 
                    src={session.user.steamProfile.avatar} 
                    alt="Steam Avatar" 
                    className="w-12 h-12 rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{session.user.steamProfile?.personaname || "Temporary Access"}</p>
                  <p className="text-sm text-green-400">
                    <span className="text-green-400">✓</span> Connected
                  </p>
                  {!session.user.steamProfile && (
                    <p className="text-xs text-amber-400 mt-1">
                      Note: Steam integration is temporarily disabled for testing
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="mb-4">
                  Link your Steam account to use purchased mods. Each mod purchase is tied to a single Steam account.
                </p>
                <button
                  onClick={() => signIn("steam", { callbackUrl: "/account" })}
                  className="flex items-center space-x-2 bg-[#171a21] hover:bg-[#2a3f5f] py-2 px-4 rounded-md text-white transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 256 259" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                    <path d="M127.778 0C60.522 0 5.212 52.412 0 119.014l68.884 28.561a37.49 37.49 0 0 1 21.609-6.816c.679 0 1.35.023 2.020.067l30.662-44.354a49.373 49.373 0 0 1 2.018-95.88c27.19 0 49.35 22.152 49.35 49.334 0 27.182-22.16 49.334-49.35 49.334-.915 0-1.828-.025-2.732-.078l-43.728 31.22c.036.572.055 1.146.055 1.724 0 20.681-16.846 37.52-37.537 37.52-18.05 0-33.153-12.797-36.75-29.807L5.016 122.425C17.376 199.944 66.918 259 127.778 259c70.57 0 127.777-57.19 127.777-127.724C255.555 57.19 198.348 0 127.778 0zm0 46.365c-15.9 0-28.817 12.913-28.817 28.802 0 15.887 12.917 28.802 28.817 28.802 15.9 0 28.817-12.915 28.817-28.802 0-15.889-12.917-28.802-28.817-28.802zm-98.48 131.815c-10.297 0-18.683-8.414-18.683-18.684 0-10.27 8.386-18.684 18.684-18.684 10.299 0 18.684 8.414 18.684 18.684.001 10.27-8.385 18.684-18.684 18.684z" fill="#FFFFFF"/>
                  </svg>
                  <span>Connect Steam Account</span>
                </button>
              </div>
            )}
          </div>
          
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Purchase History</h2>
            
            {purchases.length > 0 ? (
              <div className="divide-y divide-zinc-700">
                {purchases.map((purchase: any) => (
                  <div key={purchase.id} className="py-4">
                    <h3 className="font-semibold">{purchase.mod.title}</h3>
                    <p className="text-green-400">${purchase.mod.price}</p>
                    <p className="text-sm text-zinc-400">
                      Purchased on {new Date(purchase.purchaseDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-zinc-400 mb-4">No purchase history yet</p>
                <Link href="/mods" className="text-green-400 hover:text-green-300">
                  Browse available mods
                </Link>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="bg-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Account Information</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-zinc-400 text-sm">Discord Username</h3>
                <p>{session.user?.name}</p>
              </div>
              
              <div>
                <h3 className="text-zinc-400 text-sm">Email</h3>
                <p>{session.user?.email || "No email available"}</p>
              </div>
              
              <div>
                <h3 className="text-zinc-400 text-sm">Steam Account</h3>
                <p>
                  {session.user?.steamLinked 
                    ? (session.user.steamProfile?.personaname || "Temporarily Enabled")
                    : "Not connected"}
                </p>
              </div>
              
              <div>
                <h3 className="text-zinc-400 text-sm">Member Since</h3>
                <p>
                  {/* This would come from your database */}
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 