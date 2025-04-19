"use client";

import { useSession, signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import ModCard from "../components/ModCard";

// Mock data for all mods
const allMods = [
  {
    id: "vehicle-protection",
    title: "Vehicle Protection System",
    description: "Protect vehicles from damage in PvE environments. Configure damage from zombies, animals, and players independently.",
    price: 19.99,
    imageUrl: "/images/mods/vehicle-protection.jpg",
    category: "Vehicles"
  },
  {
    id: "advanced-zombies",
    title: "Advanced Zombie System",
    description: "Enhanced zombie AI with configurable hordes, special infected types, and unique behaviors.",
    price: 24.99,
    imageUrl: "/images/mods/zombies.jpg",
    category: "AI"
  },
  {
    id: "weather-system",
    title: "Dynamic Weather System",
    description: "Realistic weather patterns with visual effects, temperature impact, and seasonal changes.",
    price: 14.99,
    imageUrl: "/images/mods/weather.jpg",
    category: "Environment"
  },
  {
    id: "trader-plus",
    title: "Advanced Trader Framework",
    description: "Comprehensive trading system with customizable trader locations, inventory, and pricing.",
    price: 29.99,
    imageUrl: "/images/mods/trader.jpg",
    category: "Economy"
  },
  {
    id: "base-building",
    title: "Enhanced Base Building",
    description: "Advanced base building features with new structures, fortifications, and territorial systems.",
    price: 24.99,
    imageUrl: "/images/mods/base-building.jpg",
    category: "Building"
  },
  {
    id: "vehicle-pack",
    title: "Expanded Vehicle Pack",
    description: "Collection of new and enhanced vehicles with custom handling, models, and storage capacity.",
    price: 19.99,
    imageUrl: "/images/mods/vehicles.jpg",
    category: "Vehicles"
  }
];

// All possible categories
const categories = ["All", "Vehicles", "AI", "Environment", "Economy", "Building"];

export default function ModsPage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  useEffect(() => {
    if (!loading && !session) {
      redirect("/auth/signin?callbackUrl=/mods");
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

  // If the user hasn't linked their Steam account yet, show a message
  if (!session.user?.steamLinked) {
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
              onClick={() => signIn("steam", { callbackUrl: "/mods" })}
              className="inline-flex items-center space-x-2 bg-[#171a21] hover:bg-[#2a3f5f] py-3 px-6 rounded-md text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 256 259" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                <path d="M127.778 0C60.522 0 5.212 52.412 0 119.014l68.884 28.561a37.49 37.49 0 0 1 21.609-6.816c.679 0 1.35.023 2.020.067l30.662-44.354a49.373 49.373 0 0 1 2.018-95.88c27.19 0 49.35 22.152 49.35 49.334 0 27.182-22.16 49.334-49.35 49.334-.915 0-1.828-.025-2.732-.078l-43.728 31.22c.036.572.055 1.146.055 1.724 0 20.681-16.846 37.52-37.537 37.52-18.05 0-33.153-12.797-36.75-29.807L5.016 122.425C17.376 199.944 66.918 259 127.778 259c70.57 0 127.777-57.19 127.777-127.724C255.555 57.19 198.348 0 127.778 0zm0 46.365c-15.9 0-28.817 12.913-28.817 28.802 0 15.887 12.917 28.802 28.817 28.802 15.9 0 28.817-12.915 28.817-28.802 0-15.889-12.917-28.802-28.817-28.802zm-98.48 131.815c-10.297 0-18.683-8.414-18.683-18.684 0-10.27 8.386-18.684 18.684-18.684 10.299 0 18.684 8.414 18.684 18.684.001 10.27-8.385 18.684-18.684 18.684z" fill="#FFFFFF"/>
              </svg>
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
          {session.user?.image && (
            <img 
              src={session.user.image} 
              alt={session.user?.name || "User"} 
              className="w-12 h-12 rounded-full"
            />
          )}
          <div>
            <h2 className="text-xl font-bold">{session.user?.name}</h2>
            <p className="text-zinc-400">{session.user?.email}</p>
          </div>
        </div>
        
        <div className="mt-4 flex items-center p-3 bg-zinc-700 rounded-md">
          <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p>
            <span className="font-semibold">Steam Account Linked:</span> {session.user.steamProfile?.personaname || "Temporary Access Granted"}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* This would be populated with the user's purchased mods */}
        <div className="bg-zinc-800 rounded-lg p-6 flex flex-col">
          <h3 className="text-xl font-bold mb-2">No Mods Yet</h3>
          <p className="text-zinc-400 mb-4">You haven't purchased any premium mods yet.</p>
          <Link href="/store" className="mt-auto py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md text-center transition-colors">
            Browse Store
          </Link>
        </div>
      </div>
    </div>
  );
} 