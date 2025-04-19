'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const heroImages = [
  {
    src: '/DayzHero1.png',
    alt: 'DayZ Apocalyptic Scene'
  },
  {
    src: '/DayzHero2.png',
    alt: 'DayZ Night Zombies'
  },
  {
    src: '/DayzHero3.png',
    alt: 'DayZ Night Sky'
  }
];

export default function RotatingHero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  useEffect(() => {
    // Set up an interval to rotate images every 8 seconds
    const interval = setInterval(() => {
      // Start transition
      setIsTransitioning(true);
      
      // After the fade-out completes, change the image
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
        );
        
        // After changing the image, start fade-in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 50);
      }, 1000);
      
    }, 8000);
    
    // Clean up the interval on component unmount
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative h-[600px] w-full overflow-hidden">
      <div className="absolute inset-0 bg-black/70 z-10" />
      
      {/* Current visible image */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <Image
          src={heroImages[currentImageIndex].src}
          alt={heroImages[currentImageIndex].alt}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
      </div>
      
      {/* Preload all images */}
      <div className="hidden">
        {heroImages.map((image) => (
          <Image 
            key={image.src} 
            src={image.src} 
            alt="preload" 
            width={1} 
            height={1} 
          />
        ))}
      </div>
    </div>
  );
} 