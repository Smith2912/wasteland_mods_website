"use client";

import React from 'react';
import { useCart } from '../context/CartContext';

const storeMods = [
  {
    id: "vehicle-protection",
    title: "Vehicle Protection System",
    description: "Protect vehicles from damage in PvE environments.",
    price: 19.99,
    imageUrl: "/images/mods/vehicle-protection.jpg"
  },
  {
    id: "advanced-zombies",
    title: "Advanced Zombie System",
    description: "Enhanced zombie AI with configurable hordes.",
    price: 24.99,
    imageUrl: "/images/mods/zombies.jpg"
  },
  {
    id: "weather-system",
    title: "Dynamic Weather System",
    description: "Realistic weather patterns with visual effects.",
    price: 14.99,
    imageUrl: "/images/mods/weather.jpg"
  },
  {
    id: "trader-plus",
    title: "Advanced Trader Framework",
    description: "Comprehensive trading system with customizable trader locations.",
    price: 29.99,
    imageUrl: "/images/mods/trader.jpg"
  },
  {
    id: "base-building",
    title: "Enhanced Base Building",
    description: "Advanced base building features with new structures.",
    price: 24.99,
    imageUrl: "/images/mods/base-building.jpg"
  },
  {
    id: "vehicle-pack",
    title: "Expanded Vehicle Pack",
    description: "Collection of new and enhanced vehicles with custom handling.",
    price: 19.99,
    imageUrl: "/images/mods/vehicles.jpg"
  }
];

export default function StorePage() {
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = (mod: any) => {
    addToCart({
      id: mod.id,
      title: mod.title,
      price: mod.price,
      imageUrl: mod.imageUrl
    });
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Mod Store</h1>
      
      <div className="mb-8">
        <p className="text-lg text-zinc-300 mb-4">
          Welcome to the Wasteland Mods premium store. Browse our selection of high-quality mods to enhance your DayZ server experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {storeMods.map((mod) => (
          <div key={mod.id} className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
            <div className="h-48 bg-zinc-700 relative overflow-hidden">
              {mod.imageUrl ? (
                <img 
                  src={mod.imageUrl} 
                  alt={mod.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-4xl">🎮</div>
                </div>
              )}
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{mod.title}</h3>
              <p className="text-zinc-400 mb-4">{mod.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-green-500 font-bold">${mod.price.toFixed(2)}</span>
                <button 
                  className={`py-2 px-4 rounded-md transition-colors ${
                    isInCart(mod.id) 
                      ? 'bg-zinc-600 text-zinc-300 cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                  onClick={() => handleAddToCart(mod)}
                  disabled={isInCart(mod.id)}
                >
                  {isInCart(mod.id) ? 'In Cart' : 'Add to Cart'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 