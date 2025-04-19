import React from 'react';

export default function StorePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Mod Store</h1>
      
      <div className="mb-8">
        <p className="text-lg text-zinc-300 mb-4">
          Welcome to the Wasteland Mods premium store. Browse our selection of high-quality mods to enhance your DayZ server experience.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock store items using the same mods from the mods page */}
        {/* We would fetch these from an API in a real implementation */}
        
        <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
          <div className="h-48 bg-zinc-700 flex items-center justify-center">
            <div className="text-4xl">🚗</div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Vehicle Protection System</h3>
            <p className="text-zinc-400 mb-4">Protect vehicles from damage in PvE environments.</p>
            <div className="flex justify-between items-center">
              <span className="text-green-500 font-bold">$19.99</span>
              <button className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
          <div className="h-48 bg-zinc-700 flex items-center justify-center">
            <div className="text-4xl">🧟</div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Advanced Zombie System</h3>
            <p className="text-zinc-400 mb-4">Enhanced zombie AI with configurable hordes.</p>
            <div className="flex justify-between items-center">
              <span className="text-green-500 font-bold">$24.99</span>
              <button className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:scale-[1.02]">
          <div className="h-48 bg-zinc-700 flex items-center justify-center">
            <div className="text-4xl">🌦️</div>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">Dynamic Weather System</h3>
            <p className="text-zinc-400 mb-4">Realistic weather patterns with visual effects.</p>
            <div className="flex justify-between items-center">
              <span className="text-green-500 font-bold">$14.99</span>
              <button className="py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md transition-colors">
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 