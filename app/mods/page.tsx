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
  return (
    <div className="min-h-screen py-12 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">DayZ Mods Collection</h1>
          <p className="text-zinc-300 max-w-2xl mx-auto">
            Browse our premium collection of DayZ mods to enhance your server experience.
            Each mod is designed for stability and performance.
          </p>
        </div>
        
        {/* Filtering options would go here (to be implemented with client components) */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full ${
                category === "All" 
                  ? "bg-green-600 text-white" 
                  : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Mods grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allMods.map((mod) => (
            <ModCard key={mod.id} {...mod} />
          ))}
        </div>
      </div>
    </div>
  );
} 