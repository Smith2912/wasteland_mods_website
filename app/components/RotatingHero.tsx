'use client';

import { useState, useEffect } from 'react';

const heroImages = [
  {
    src: '/DayzHero1.png',
    alt: 'DayZ Apocalyptic Scene',
    position: 'center 15%' // Custom position for first image
  },
  {
    src: '/DayzHero2.png',
    alt: 'DayZ Night Zombies',
    position: 'center 35%' // Custom position for second image
  },
  {
    src: '/DayzHero3.png',
    alt: 'DayZ Night Sky',
    position: 'center 40%' // Custom position for third image
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
    <div className="absolute inset-0 w-full h-full">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      
      {/* Current visible image */}
      <div 
        className={`absolute inset-0 transition-opacity duration-1500 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
      >
        <div className="w-full h-full">
          <img
            src={heroImages[currentImageIndex].src}
            alt={heroImages[currentImageIndex].alt}
            className="w-full h-full object-cover"
            style={{
              objectPosition: heroImages[currentImageIndex].position,
            }}
          />
        </div>
      </div>
      
      {/* Preload all images for smoother transitions */}
      <div className="hidden">
        {heroImages.map((image) => (
          <img 
            key={image.src} 
            src={image.src} 
            alt="preload" 
          />
        ))}
      </div>
    </div>
  );
} 