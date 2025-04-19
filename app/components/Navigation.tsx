'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import AuthButton from './AuthButton';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Mods', path: '/store' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="bg-black text-white">
      {/* Logo Bar */}
      <div className="container mx-auto px-4 py-2 flex justify-center">
        <Link href="/" className="flex items-center">
          <Image 
            src="/NewWastelandModsLogoDiscord.png" 
            alt="Wasteland Mods Logo" 
            width={350} 
            height={350} 
            className="h-auto" 
            priority
          />
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="border-b border-red-700 border-t">
        <div className="container mx-auto px-4 flex justify-between items-center py-3">
          {/* Desktop navigation */}
          <div className="hidden md:flex md:items-center md:justify-center w-full space-x-10">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`transition-colors hover:text-red-500 font-bold text-lg ${
                  isActive(item.path) ? 'text-red-500 text-glow' : ''
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="absolute right-4">
              <AuthButton />
            </div>
          </div>
          
          {/* Mobile menu button and condensed navigation */}
          <div className="flex items-center justify-between w-full md:hidden">
            <div className="flex space-x-4">
              {navItems.slice(0, 2).map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`transition-colors hover:text-red-500 font-bold ${
                    isActive(item.path) ? 'text-red-500 text-glow' : ''
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-red-500 p-2"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>
      
      {/* Mobile navigation menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-zinc-900 border border-red-900 rugged-container">
          <div className="flex flex-col px-4 py-2 space-y-3">
            {navItems.slice(2).map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`transition-colors hover:text-red-500 ${
                  isActive(item.path) ? 'text-red-500 text-glow' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div onClick={() => setIsMenuOpen(false)}>
              <AuthButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 