'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import WatermarkedImage from '../../components/WatermarkedImage';

// Define types
interface ModData {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  features: string[];
  longDescription: string;
  requirements: string[];
  compatibility: string[];
  version: string;
  lastUpdated: string;
}

interface ModsDataType {
  [key: string]: ModData;
}

// Mock data for mods
const modsData: ModsDataType = {
  "vehicle-protection": {
    id: "vehicle-protection",
    title: "Vehicle Protection System",
    description: "Protect vehicles from damage in PvE environments. Configure damage from zombies, animals, and players independently.",
    price: 19.99,
    imageUrl: "/images/mods/vehicle-protection.jpg",
    category: "Vehicles",
    features: [
      "Prevent vehicle damage from zombies and animals",
      "Configurable protection levels for different damage types",
      "Optional player damage settings",
      "Building collision handling",
      "Performance-optimized code"
    ],
    longDescription: `The Vehicle Protection System is designed to give server owners complete control over how vehicles interact with the environment, especially in PvE settings.

This mod allows you to configure exactly how vehicles respond to different types of damage, letting you create a gameplay experience that matches your server's style.

Key features include protection from zombie and animal damage, configurable collision handling with buildings, and the ability to set different rules for player interactions. The code is highly optimized to ensure minimal server performance impact.

All settings are easily configured through a simple JSON file, and the mod comes with comprehensive documentation to help you set everything up.`,
    requirements: [
      "DayZ version 1.19+",
      "Minimum 4GB server RAM",
      "Compatible with most popular mods"
    ],
    compatibility: [
      "Works with most vehicle mods",
      "Compatible with trader mods",
      "May require configuration adjustments when used with other vehicle protection systems"
    ],
    version: "1.3.2",
    lastUpdated: "April 15, 2023"
  },
  "advanced-zombies": {
    id: "advanced-zombies",
    title: "Advanced Zombie System",
    description: "Enhanced zombie AI with configurable hordes, special infected types, and unique behaviors.",
    price: 24.99,
    imageUrl: "/images/mods/zombies.jpg",
    category: "AI",
    features: [
      "Custom zombie hordes with configurable spawn rates",
      "5 special infected types with unique abilities",
      "Enhanced AI behaviors and pathfinding",
      "Dynamic spawn system based on player activity",
      "Performance-optimized for minimal server impact"
    ],
    longDescription: `The Advanced Zombie System completely transforms the infected experience in DayZ with smarter AI, special zombie types, and dynamic horde mechanics.

This mod introduces 5 unique special infected types, each with their own abilities and behaviors that will challenge even experienced players. From fast runners to explosive bombers, these special zombies add a new layer of strategy to combat.

The dynamic horde system creates emergent gameplay by spawning groups of zombies based on player activity, sound levels, and time of day. Areas with more player traffic will naturally become more dangerous over time.

All aspects of the system are highly configurable, allowing server owners to fine-tune the difficulty and gameplay experience to match their community's preferences.`,
    requirements: [
      "DayZ version 1.19+",
      "Minimum 6GB server RAM",
      "Compatible with most popular mods"
    ],
    compatibility: [
      "Works with most zombie/infected mods",
      "May require configuration with other AI mods",
      "Compatible with most map mods"
    ],
    version: "2.1.0",
    lastUpdated: "May 2, 2023"
  },
  "weather-system": {
    id: "weather-system",
    title: "Dynamic Weather System",
    description: "Realistic weather patterns with visual effects, temperature impact, and seasonal changes.",
    price: 14.99,
    imageUrl: "/images/mods/weather.jpg",
    category: "Environment",
    features: [
      "Dynamic weather cycles with realistic progression",
      "Temperature effects on player survival",
      "Visual effects including fog, rain, and snow",
      "Seasonal changes affecting the environment",
      "Server-side configuration for weather patterns"
    ],
    longDescription: `The Dynamic Weather System creates a living, breathing world with realistic weather patterns that directly impact gameplay and survival.

Experience changing weather conditions that affect temperature, visibility, and ambient sounds. From light fog to heavy thunderstorms, each weather state creates unique gameplay scenarios and challenges.

The mod includes seasonal changes that transform the environment over time, with effects on wildlife spawns, plant growth, and overall survival difficulty. Winter months bring colder temperatures requiring better insulation, while summer allows for easier living but with different challenges.

All weather patterns are configurable, allowing server owners to create their ideal balance between realism and gameplay. Weather can be synchronized across the server or vary by region for a more dynamic experience.`,
    requirements: [
      "DayZ version 1.18+",
      "Minimum 4GB server RAM",
      "Compatible with most popular mods"
    ],
    compatibility: [
      "Works with most environment and survival mods",
      "May conflict with other weather systems",
      "Compatible with most map mods"
    ],
    version: "1.5.3",
    lastUpdated: "March 10, 2023"
  }
};

export default function ModDetailPage() {
  const params = useParams();
  const modId = params.id as string;
  const mod = modsData[modId];
  
  const [activeTab, setActiveTab] = useState<'description' | 'requirements' | 'compatibility'>('description');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  const handlePurchaseClick = async () => {
    setIsPurchasing(true);
    setPurchaseStatus('processing');
    
    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setPurchaseStatus('success');
    } catch (error) {
      setPurchaseStatus('error');
    }
  };
  
  // If mod not found
  if (!mod) {
    return (
      <div className="min-h-screen py-12 bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Mod Not Found</h1>
          <p className="text-zinc-300 mb-8">
            The mod you're looking for doesn't exist or has been removed.
          </p>
          <Link 
            href="/mods" 
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md transition-colors"
          >
            Browse Mods
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-12 bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/mods" className="text-green-400 hover:text-green-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Mods
          </Link>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Image and Purchase */}
          <div className="lg:col-span-1">
            <div className="bg-zinc-800 rounded-lg overflow-hidden shadow-lg">
              <div className="relative h-64 w-full">
                <WatermarkedImage
                  src={mod.imageUrl}
                  alt={mod.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  watermarkPosition="center"
                  watermarkSize="medium"
                  watermarkOpacity={0.4}
                  watermarkColor="rgba(255, 255, 255, 0.9)"
                />
                <div className="absolute top-2 right-2 bg-green-600 text-white text-sm px-2 py-1 rounded">
                  {mod.category}
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-zinc-300 mb-1">Price</p>
                  <p className="text-white text-3xl font-bold">${mod.price.toFixed(2)}</p>
                </div>
                
                {purchaseStatus === 'idle' && (
                  <button
                    onClick={handlePurchaseClick}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md transition-colors font-medium"
                  >
                    Purchase Mod
                  </button>
                )}
                
                {purchaseStatus === 'processing' && (
                  <button
                    disabled
                    className="w-full bg-green-800 text-white py-3 rounded-md font-medium flex items-center justify-center"
                  >
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </button>
                )}
                
                {purchaseStatus === 'success' && (
                  <div>
                    <div className="mb-4 p-3 bg-green-700/50 border border-green-600 rounded-md text-center">
                      Purchase successful! Check your email for download instructions.
                    </div>
                    <Link
                      href="/dashboard"
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md transition-colors font-medium block text-center"
                    >
                      Go to Downloads
                    </Link>
                  </div>
                )}
                
                {purchaseStatus === 'error' && (
                  <div>
                    <div className="mb-4 p-3 bg-red-700/50 border border-red-600 rounded-md text-center">
                      There was an error processing your payment. Please try again.
                    </div>
                    <button
                      onClick={handlePurchaseClick}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-md transition-colors font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                )}
                
                <div className="mt-6">
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    <span className="text-zinc-300">Instant Digital Delivery</span>
                  </div>
                  <div className="flex items-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M15.485 4.125a12.18 12.18 0 00-10.485 5.749M17.25 9.75v1.5m0 0v1.5m0-1.5h1.5m-1.5 0h-1.5" />
                    </svg>
                    <span className="text-zinc-300">Free Updates</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                    <span className="text-zinc-300">Premium Support</span>
                  </div>
                </div>
                
                <div className="mt-6 pt-6 border-t border-zinc-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-300">Version:</span>
                    <span className="text-white">{mod.version}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-300">Last Updated:</span>
                    <span className="text-white">{mod.lastUpdated}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Description and Details */}
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold mb-4">{mod.title}</h1>
            
            <div className="bg-zinc-800 rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="border-b border-zinc-700">
                <div className="flex">
                  <button
                    className={`px-6 py-3 text-lg ${
                      activeTab === 'description' 
                        ? 'text-white border-b-2 border-green-500' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    onClick={() => setActiveTab('description')}
                  >
                    Description
                  </button>
                  <button
                    className={`px-6 py-3 text-lg ${
                      activeTab === 'requirements' 
                        ? 'text-white border-b-2 border-green-500' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    onClick={() => setActiveTab('requirements')}
                  >
                    Requirements
                  </button>
                  <button
                    className={`px-6 py-3 text-lg ${
                      activeTab === 'compatibility' 
                        ? 'text-white border-b-2 border-green-500' 
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                    onClick={() => setActiveTab('compatibility')}
                  >
                    Compatibility
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {activeTab === 'description' && (
                  <div>
                    <div className="prose prose-lg prose-invert max-w-none">
                      {mod.longDescription.split('\n\n').map((paragraph: string, index: number) => (
                        <p key={index} className="mb-4">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    
                    <div className="mt-8">
                      <h3 className="text-xl font-bold mb-4">Features</h3>
                      <ul className="space-y-2">
                        {mod.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                
                {activeTab === 'requirements' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">System Requirements</h3>
                    <ul className="space-y-2">
                      {mod.requirements.map((requirement: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-6 p-4 bg-amber-900/20 border border-amber-800 rounded-md">
                      <p className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-500 mr-2 mt-1 flex-shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        Note: Requirements may vary depending on your server configuration and other installed mods. For optimal performance, we recommend exceeding the minimum requirements.
                      </p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'compatibility' && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Compatibility Information</h3>
                    <ul className="space-y-2">
                      {mod.compatibility.map((item: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-500 mr-2 mt-1 flex-shrink-0">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-md">
                      <p className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-500 mr-2 mt-1 flex-shrink-0">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        If you're unsure about compatibility with your specific server setup, please contact our support team before purchasing. We're happy to help ensure compatibility.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-zinc-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Still have questions?</h3>
              <p className="text-zinc-300 mb-4">
                If you have any questions about this mod, compatibility concerns, or need help with installation,
                our team is here to help. Contact us using any of the options below.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Contact Support
                </Link>
                <a
                  href="https://discord.gg/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16" className="mr-2">
                    <path d="M13.545 2.907a13.227 13.227 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.258 8.258 0 0 0-.412-.833.051.051 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.041.041 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.276 13.276 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.051.051 0 0 0-.018-.011 8.875 8.875 0 0 1-1.248-.595.05.05 0 0 1-.02-.066.051.051 0 0 1 .015-.019c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.052.052 0 0 1 .053.007c.08.066.164.132.248.195a.051.051 0 0 1-.004.085 8.254 8.254 0 0 1-1.249.594.05.05 0 0 0-.03.03.052.052 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.235 13.235 0 0 0 4.001-2.02.049.049 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.034.034 0 0 0-.02-.019Zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612Zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612Z"/>
                  </svg>
                  Join Discord
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 