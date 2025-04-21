"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ModCard from "../components/ModCard";
import { supabase } from "../lib/supabase";
import { User } from "@supabase/supabase-js";
import { getUserPurchases } from "../lib/db";
import { createClient } from "@supabase/supabase-js";
import SteamIcon from "../components/SteamIcon";

interface ModDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  downloadUrl: string;
  version: string;
}

interface PurchasedMod extends ModDetails {
  purchaseDate: string;
  transactionId: string;
}

// Map of all available mods with details
const modsMap: Record<string, ModDetails> = {
  "vehicle-protection": {
    id: "vehicle-protection",
    title: "Vehicle Protection System",
    description: "Protect vehicles from damage in PvE environments. Configure damage from zombies, animals, and players independently.",
    price: 19.99,
    imageUrl: "/images/mods/vehicle-protection.jpg",
    category: "Vehicles",
    downloadUrl: "/downloads/vehicle-protection.zip",
    version: "1.0.2"
  },
  "advanced-zombies": {
    id: "advanced-zombies",
    title: "Advanced Zombie System",
    description: "Enhanced zombie AI with configurable hordes, special infected types, and unique behaviors.",
    price: 24.99,
    imageUrl: "/images/mods/zombies.jpg",
    category: "AI",
    downloadUrl: "/downloads/advanced-zombies.zip",
    version: "2.1.0"
  },
  "weather-system": {
    id: "weather-system",
    title: "Dynamic Weather System",
    description: "Realistic weather patterns with visual effects, temperature impact, and seasonal changes.",
    price: 14.99,
    imageUrl: "/images/mods/weather.jpg",
    category: "Environment",
    downloadUrl: "/downloads/weather-system.zip",
    version: "1.3.5"
  },
  "trader-plus": {
    id: "trader-plus",
    title: "Advanced Trader Framework",
    description: "Comprehensive trading system with customizable trader locations, inventory, and pricing.",
    price: 29.99,
    imageUrl: "/images/mods/trader.jpg",
    category: "Economy",
    downloadUrl: "/downloads/trader-plus.zip",
    version: "3.0.1"
  },
  "base-building": {
    id: "base-building",
    title: "Enhanced Base Building",
    description: "Advanced base building features with new structures, fortifications, and territorial systems.",
    price: 24.99,
    imageUrl: "/images/mods/base-building.jpg",
    category: "Building",
    downloadUrl: "/downloads/base-building.zip",
    version: "2.2.3"
  },
  "vehicle-pack": {
    id: "vehicle-pack",
    title: "Expanded Vehicle Pack",
    description: "Collection of new and enhanced vehicles with custom handling, models, and storage capacity.",
    price: 19.99,
    imageUrl: "/images/mods/vehicles.jpg",
    category: "Vehicles",
    downloadUrl: "/downloads/vehicle-pack.zip",
    version: "1.7.0"
  }
};

export default function ModsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [steamLinked, setSteamLinked] = useState(false);
  const [steamUsername, setSteamUsername] = useState<string | null>(null);
  const [purchasedMods, setPurchasedMods] = useState<PurchasedMod[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [unlinkLoading, setUnlinkLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        
        // Create Supabase client
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL || '',
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
        );
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setLoading(false);
          return;
        }
        
        if (!session) {
          router.push('/auth/signin?callbackUrl=/mods');
          return;
        }
        
        // Store the access token for download links
        setAccessToken(session.access_token);
        
        // Set the user
        setUser(session.user);
        
        // Check if Steam is linked
        const steamId = session.user.user_metadata?.steamId;
        const steamUsername = session.user.user_metadata?.steamUsername;
        
        setSteamLinked(!!steamId);
        setSteamUsername(steamUsername || null);
        
        // Fetch user's purchases
        const { data: purchases, error: purchasesError } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('status', 'completed');
          
        if (purchasesError) {
          console.error('Error fetching purchases:', purchasesError);
        } else if (purchases) {
          // Map purchases to mods
          const userPurchasedMods: PurchasedMod[] = purchases.map(purchase => {
            const modDetails = modsMap[purchase.mod_id];
            return {
              ...modDetails,
              purchaseDate: formatDate(purchase.purchase_date),
              transactionId: purchase.transaction_id
            };
          }).filter(mod => mod.id); // Filter out any null mods (in case we have purchases for mods not in our map)
          
          setPurchasedMods(userPurchasedMods);
        }
      } catch (error) {
        console.error('Error in getUser:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getUser();
  }, [router]);

  const handleSteamLink = () => {
    router.push('/api/auth/steam');
  };

  const handleSteamUnlink = async () => {
    // Show confirmation dialog
    if (!confirm('Are you sure you want to unlink your Steam account? You will need to link it again to download mods.')) {
      return;
    }
    
    try {
      setUnlinkLoading(true);
      
      if (!accessToken) {
        alert('You need to be logged in to unlink your Steam account.');
        return;
      }
      
      // Call the API route to unlink Steam account
      const response = await fetch('/api/auth/unlink-steam', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Error unlinking Steam account:', data.error);
        alert('Failed to unlink Steam account. Please try again.');
      } else {
        // Update local state
        setSteamLinked(false);
        setSteamUsername(null);
        alert('Steam account unlinked successfully.');
        
        // Refresh the page to show the Steam link screen
        router.refresh();
      }
    } catch (error) {
      console.error('Error in handleSteamUnlink:', error);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setUnlinkLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Update the downloadUrl function to include the token
  const getDownloadUrl = (modId: string) => {
    return `/api/download/${modId}${accessToken ? `?token=${accessToken}` : ''}`;
  };

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

  if (!user) {
    return null; // This will never render because of the redirect
  }

  // If the user hasn't linked their Steam account yet, show a message
  if (!steamLinked) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-zinc-800 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-3xl font-bold mb-4">Link Your Steam Account</h1>
          <p className="text-zinc-300 mb-6">
            To access your purchased mods, you need to link your Steam account first. 
            This ensures your mods are only used on your authorized account.
          </p>
          <div className="mb-8">
            <button
              onClick={handleSteamLink}
              className="inline-flex items-center space-x-2 bg-[#171a21] hover:bg-[#2a3f5f] py-3 px-6 rounded-md text-white transition-colors"
            >
              <SteamIcon className="w-5 h-5 mr-2" />
              <span>Connect Steam Account</span>
            </button>
          </div>
          <p className="text-zinc-500 text-sm">
            We only request basic profile information from your Steam account.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">Your Premium Mods</h1>
      
      <div className="bg-zinc-800 rounded-lg p-6 mb-8">
        <div className="flex items-center space-x-4 mb-4">
          {user.user_metadata?.avatar_url && (
            <img 
              src={user.user_metadata.avatar_url} 
              alt={user.user_metadata?.full_name || "User"} 
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-bold">{user.user_metadata?.full_name || user.email}</h2>
            <p className="text-zinc-400">{user.email}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between p-3 bg-zinc-700 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p>
              <span className="font-semibold">Steam Account Linked:</span> {steamUsername || "Temporary Access Granted"}
            </p>
          </div>
          <button
            onClick={handleSteamUnlink}
            disabled={unlinkLoading}
            className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-md transition-colors flex items-center"
            title="Unlink your Steam account - you'll need to link again to download mods"
          >
            {unlinkLoading ? (
              <span className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-1"></span>
            ) : (
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
            Unlink Steam
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchasedMods.length > 0 ? (
          purchasedMods.map((mod) => (
            <div key={mod.id} className="bg-zinc-800 rounded-lg overflow-hidden flex flex-col">
              <div className="h-48 bg-zinc-700 relative">
                {mod.imageUrl && (
                  <img 
                    src={mod.imageUrl} 
                    alt={mod.title} 
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2 bg-green-600 text-xs font-bold px-2 py-1 rounded">
                  v{mod.version}
                </div>
              </div>
              <div className="p-6 flex-grow">
                <h3 className="text-xl font-bold mb-2">{mod.title}</h3>
                <p className="text-zinc-400 mb-4 text-sm">{mod.description}</p>
                <div className="text-sm text-zinc-500 mb-3">
                  <p>Purchased: {mod.purchaseDate}</p>
                </div>
              </div>
              <div className="p-4 pt-0 mt-auto">
                <a 
                  href={getDownloadUrl(mod.id)}
                  className="w-full block text-center py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors"
                >
                  Download
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-zinc-800 rounded-lg p-6 flex flex-col col-span-full">
            <h3 className="text-xl font-bold mb-2">No Mods Yet</h3>
            <p className="text-zinc-400 mb-4">You haven't purchased any premium mods yet.</p>
            <Link href="/store" className="mt-auto py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md text-center transition-colors self-start">
              Browse Store
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 