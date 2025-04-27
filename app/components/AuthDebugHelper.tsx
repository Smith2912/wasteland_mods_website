'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/providers';

export default function AuthDebugHelper() {
  const { session, isLoading } = useAuth();
  const [storageData, setStorageData] = useState<Record<string, string>>({});
  const [cookieData, setCookieData] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function loadStorageData() {
      const data: Record<string, string> = {};
      
      // Check for Supabase auth items in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('sb') || key.includes('auth'))) {
          try {
            data[key] = localStorage.getItem(key) || 'null';
          } catch (e) {
            data[key] = `Error reading: ${e}`;
          }
        }
      }
      
      setStorageData(data);
    }
    
    function loadCookieData() {
      setCookieData(document.cookie);
    }
    
    loadStorageData();
    loadCookieData();
    
    // Set up a listener for storage changes
    const handleStorageChange = () => {
      loadStorageData();
      loadCookieData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Check every 3 seconds for changes
    const interval = setInterval(() => {
      loadStorageData();
      loadCookieData();
    }, 3000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) {
    return (
      <button 
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 rounded shadow z-50"
      >
        Show Auth Debug
      </button>
    );
  }

  const user = session?.user;

  return (
    <div className="fixed bottom-0 right-0 bg-gray-900 text-white p-4 w-full md:w-1/2 lg:w-1/3 h-1/2 overflow-auto z-50 shadow-lg rounded-tl-lg">
      <div className="flex justify-between mb-4">
        <h3 className="text-lg font-bold">Auth Debug Information</h3>
        <button onClick={() => setIsVisible(false)} className="text-white">×</button>
      </div>
      
      <div className="mb-4">
        <h4 className="font-bold border-b border-gray-700 pb-1 mb-2">Session State</h4>
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify({ 
            isLoading,
            hasSession: !!session,
            isAuthenticated: !!user,
            userId: user?.id || 'none',
            userEmail: user?.email || 'none',
            provider: user?.app_metadata?.provider || 'none',
            hasSteam: !!user?.user_metadata?.steamId,
            steamId: user?.user_metadata?.steamId || 'none'
          }, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4">
        <h4 className="font-bold border-b border-gray-700 pb-1 mb-2">Local Storage</h4>
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify(storageData, null, 2)}
        </pre>
      </div>
      
      <div>
        <h4 className="font-bold border-b border-gray-700 pb-1 mb-2">Cookies</h4>
        <pre className="text-sm overflow-x-auto">
          {cookieData.split(';').map(cookie => cookie.trim()).join('\n')}
        </pre>
      </div>
    </div>
  );
} 