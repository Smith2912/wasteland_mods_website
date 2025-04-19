"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // If someone manually navigates to this page without going through checkout,
    // redirect them to the store page after 5 seconds
    const timer = setTimeout(() => {
      router.push('/store');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto bg-zinc-800 rounded-lg p-8 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-3xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-zinc-300 mb-6">
          Thank you for your purchase. Your mods are now available in your account.
        </p>
        
        <div className="bg-zinc-700 rounded-md p-4 mb-6">
          <h2 className="text-xl font-bold mb-2">Next Steps</h2>
          <ol className="text-left list-decimal pl-5 space-y-2">
            <li>Go to the "My Mods" section in your account</li>
            <li>Download your purchased mods</li>
            <li>Install them on your server</li>
            <li>Check the documentation for installation instructions</li>
          </ol>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/mods" 
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-md transition-colors"
          >
            View My Mods
          </Link>
          <Link 
            href="/store" 
            className="bg-zinc-600 hover:bg-zinc-700 px-6 py-3 rounded-md transition-colors"
          >
            Return to Store
          </Link>
        </div>
        
        <p className="mt-8 text-sm text-zinc-500">
          You will be redirected to the store in 10 seconds.
        </p>
      </div>
    </div>
  );
} 