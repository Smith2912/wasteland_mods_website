import Image from "next/image";
import Link from "next/link";
import ModCard from "./components/ModCard";
import RotatingHero from "./components/RotatingHero";

// Mock data for featured mods
const featuredMods = [
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
  }
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative aspect-[16/9] md:aspect-[21/9] lg:aspect-auto lg:h-[600px] w-full">
        <RotatingHero />
        
        <div className="absolute inset-0 flex items-center z-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 text-glow">
                Premium DayZ Mods for Your Server
              </h1>
              <p className="text-lg md:text-xl text-zinc-200 mb-6 md:mb-8">
                Enhance your DayZ server with high-quality, professionally developed mods that will keep your players coming back.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link 
                  href="/mods" 
                  className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 md:px-6 md:py-3 rounded-md text-base md:text-lg font-medium transition-colors accent-border"
                >
                  Browse Mods
                </Link>
                <Link 
                  href="/about" 
                  className="bg-transparent border-2 border-red-700 hover:bg-red-900/20 text-white px-4 py-2 md:px-6 md:py-3 rounded-md text-base md:text-lg font-medium transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Mods Section */}
      <section className="py-16 bg-black rugged-container">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold mb-4 text-red-500 text-glow">Featured Mods</h2>
            <p className="text-zinc-300 max-w-2xl mx-auto">
              Check out our most popular DayZ mods, designed to enhance gameplay and server management.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredMods.map((mod) => (
              <ModCard key={mod.id} {...mod} />
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Link 
              href="/mods" 
              className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-md text-lg font-medium transition-colors"
            >
              View All Mods
            </Link>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-zinc-950">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold mb-4 text-red-500 text-glow">Why Choose Our Mods?</h2>
            <p className="text-zinc-300 max-w-2xl mx-auto">
              We develop high-quality DayZ mods with a focus on performance, compatibility, and customization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 p-6 rounded-lg border border-red-900 rugged-container">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-400">Quality Tested</h3>
              <p className="text-zinc-300">
                All mods undergo rigorous testing on active servers to ensure stability and performance before release.
              </p>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-lg border border-red-900 rugged-container">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-400">Fully Customizable</h3>
              <p className="text-zinc-300">
                Extensive configuration options allow you to tailor each mod to your server's specific needs and playstyle.
              </p>
            </div>
            
            <div className="bg-zinc-900 p-6 rounded-lg border border-red-900 rugged-container">
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2 text-red-400">Premium Support</h3>
              <p className="text-zinc-300">
                Get direct support from the developers with installation help, troubleshooting, and ongoing updates.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-red-900 to-black border-t border-red-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white text-glow">Ready to Enhance Your DayZ Server?</h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Browse our collection of premium mods and take your server to the next level today.
          </p>
          <Link 
            href="/mods" 
            className="bg-red-700 text-white hover:bg-red-800 px-6 py-3 rounded-md text-lg font-medium transition-colors accent-border"
          >
            Get Started
          </Link>
        </div>
      </section>
    </div>
  );
}
