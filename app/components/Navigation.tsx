'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Mods', path: '/mods' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="bg-zinc-900 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Wasteland Mods
        </Link>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="text-white p-2"
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
        
        {/* Desktop navigation */}
        <div className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`transition-colors hover:text-green-400 ${
                isActive(item.path) ? 'text-green-400' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
          <Link
            href="/auth/login"
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
      
      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-zinc-800 mt-2">
          <div className="flex flex-col px-4 py-2 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`transition-colors hover:text-green-400 ${
                  isActive(item.path) ? 'text-green-400' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <Link
              href="/auth/login"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md transition-colors text-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
} 