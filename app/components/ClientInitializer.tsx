'use client';

import { useEffect } from 'react';
import { initClientUtils } from '../lib/clientUtils';

/**
 * Component that initializes client-side utilities
 * This runs once when the app loads
 */
export default function ClientInitializer() {
  useEffect(() => {
    // Initialize all client utilities
    initClientUtils();
  }, []);

  // This component doesn't render anything
  return null;
} 