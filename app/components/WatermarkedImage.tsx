'use client';

import Image, { ImageProps } from 'next/image';
import { CSSProperties, useState } from 'react';

interface WatermarkedImageProps extends Omit<ImageProps, 'onError'> {
  watermarkText?: string;
  watermarkOpacity?: number;
  watermarkSize?: 'small' | 'medium' | 'large';
  watermarkPosition?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center';
  watermarkColor?: string;
  watermarkRotation?: number;
}

export default function WatermarkedImage({
  watermarkText = 'Wasteland Mods',
  watermarkOpacity = 0.4,
  watermarkSize = 'medium',
  watermarkPosition = 'center',
  watermarkColor = 'rgba(255, 255, 255, 0.8)',
  watermarkRotation = -30,
  className = '',
  ...props
}: WatermarkedImageProps) {
  const [error, setError] = useState(false);

  // Determine font size based on watermarkSize
  const getFontSize = () => {
    switch (watermarkSize) {
      case 'small': return '1rem';
      case 'large': return '2.5rem';
      case 'medium':
      default: return '1.8rem';
    }
  };

  // Determine position based on watermarkPosition
  const getPosition = (): CSSProperties => {
    switch (watermarkPosition) {
      case 'topLeft':
        return { top: '10px', left: '10px' };
      case 'topRight':
        return { top: '10px', right: '10px' };
      case 'bottomLeft':
        return { bottom: '10px', left: '10px' };
      case 'bottomRight':
        return { bottom: '10px', right: '10px' };
      case 'center':
      default:
        return { top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${watermarkRotation}deg)` };
    }
  };

  // Set up watermark style
  const watermarkStyle: CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    fontSize: getFontSize(),
    color: watermarkColor,
    opacity: watermarkOpacity,
    pointerEvents: 'none',
    whiteSpace: 'nowrap',
    fontWeight: 'bold',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
    ...getPosition()
  };

  return (
    <div className={`relative ${className}`} style={{ display: 'block', overflow: 'hidden' }}>
      <Image
        {...props}
        onError={() => setError(true)}
      />
      {!error && (
        <div style={watermarkStyle}>
          {watermarkText}
        </div>
      )}
    </div>
  );
} 