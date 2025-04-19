"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { loadScript } from '@paypal/paypal-js';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Cart({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeFromCart, clearCart, getCartTotal } = useCart();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const router = useRouter();
  const total = getCartTotal();
  const { session, isLoading } = useAuth();
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalButtonsRendered = useRef(false);
  const renderAttempts = useRef(0);
  const maxRenderAttempts = 5;

  const handleSignIn = () => {
    onClose();
    router.push('/auth/signin?callbackUrl=/');
  };

  // Load PayPal script when cart is opened
  useEffect(() => {
    if (isOpen && !paypalLoaded && items.length > 0 && session) {
      const loadPayPalScript = async () => {
        try {
          await loadScript({ 
            clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb', 
            currency: 'USD'
          });
          setPaypalLoaded(true);
        } catch (error) {
          console.error('Failed to load PayPal JS SDK:', error);
          setError('Failed to load payment system. Please try again later.');
        }
      };
      
      loadPayPalScript();
    }
    
    // Reset the rendered state when cart is closed
    if (!isOpen) {
      paypalButtonsRendered.current = false;
      renderAttempts.current = 0;
    }
  }, [isOpen, paypalLoaded, items.length, session]);

  // Render PayPal buttons when everything is ready
  useEffect(() => {
    // Only proceed if all conditions are met
    if (!paypalLoaded || items.length === 0 || !window.paypal || !session || !isOpen) {
      return;
    }
    
    // Prevent multiple renders of the PayPal buttons
    if (paypalButtonsRendered.current) {
      return;
    }

    // Check if we've exceeded max attempts
    if (renderAttempts.current >= maxRenderAttempts) {
      console.error('Max render attempts exceeded for PayPal buttons');
      setError('Unable to initialize payment system. Please refresh and try again.');
      return;
    }
    
    // Increment render attempt counter
    renderAttempts.current += 1;
    
    // Function to render PayPal buttons
    const renderPayPalButtons = () => {
      // Check if the container exists before rendering
      const container = document.getElementById('paypal-button-container');
      if (!container) {
        console.error(`PayPal container not found (attempt ${renderAttempts.current})`);
        
        // Schedule another attempt if we haven't exceeded the max
        if (renderAttempts.current < maxRenderAttempts) {
          setTimeout(renderPayPalButtons, 200 * renderAttempts.current); // Increasing delay with each attempt
        } else {
          setError('Payment system initialization failed. Please refresh the page.');
        }
        return;
      }
      
      try {
        // Clear previous PayPal buttons if they exist
        container.innerHTML = '';
        
        // @ts-ignore - PayPal types aren't available
        window.paypal.Buttons({
          createOrder: (_data: any, actions: any) => {
            return actions.order.create({
              purchase_units: [{
                amount: {
                  value: total.toFixed(2),
                  currency_code: 'USD'
                },
                description: `Wasteland Mods Purchase - ${items.length} item(s)`
              }]
            });
          },
          onApprove: async (_data: any, actions: any) => {
            try {
              setProcessing(true);
              setError(null);
              
              // Capture the PayPal order (complete the payment)
              const order = await actions.order.capture();
              console.log('Order completed successfully', order);
              
              // Get a fresh access token to ensure it's valid
              const { data: authData, error: authError } = await supabase.auth.getSession();
              
              if (authError || !authData.session) {
                console.error('Session refresh error:', authError);
                throw new Error('Authentication error. Please log in again.');
              }
              
              // Set up request with auth headers
              const accessToken = authData.session.access_token;
              console.log('Using access token:', accessToken ? 'Valid token present' : 'No token');
              
              // Record the purchase using our API
              const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                  items,
                  transactionId: order.id
                }),
                credentials: 'include'
              });
              
              if (!response.ok) {
                // Attempt to get detailed error from response
                let errorData;
                try {
                  errorData = await response.json();
                } catch (e) {
                  errorData = { error: 'Failed to record purchase' };
                }
                
                console.error('Checkout API error:', errorData);
                throw new Error(errorData.error || 'Failed to record purchase');
              }
              
              // Payment successful
              setPaymentSuccessful(true);
              
              // Clear cart and redirect to success page
              clearCart();
              router.push('/checkout/success');
            } catch (error) {
              console.error('Failed to complete order:', error);
              setError(typeof error === 'object' && error !== null && 'message' in error 
                ? (error as Error).message 
                : 'There was a problem processing your payment. Please try again.');
              setProcessing(false);
            }
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            setError('Payment failed. Please try again or use a different payment method.');
            setProcessing(false);
          }
        }).render(container);
        
        // Mark as rendered to prevent duplicate renders
        paypalButtonsRendered.current = true;
        console.log('PayPal buttons rendered successfully');
      } catch (err) {
        console.error('Failed to render PayPal buttons:', err);
        setError('There was a problem setting up the payment system. Please try again later.');
      }
    };
    
    // Initial render attempt with a small delay
    setTimeout(renderPayPalButtons, 100);
    
  }, [paypalLoaded, items, items.length, total, clearCart, router, session, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-70" onClick={onClose}></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-zinc-900 border border-red-900 w-full max-w-2xl rounded-lg shadow-xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b border-red-900">
            <h2 className="text-2xl font-bold">Your Cart</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-4">
            {items.length === 0 ? (
              <div className="text-center py-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="mt-4 text-xl">Your cart is empty</p>
                <button 
                  onClick={onClose}
                  className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-md transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center p-3 bg-zinc-800 rounded-lg">
                      {item.imageUrl && (
                        <div className="w-16 h-16 bg-zinc-700 rounded-md overflow-hidden mr-4 flex-shrink-0">
                          <Image 
                            src={item.imageUrl} 
                            alt={item.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-green-500">${item.price.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-zinc-400 hover:text-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 border-t border-zinc-800 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-500">${total.toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-6">
                    {error && (
                      <div className="bg-red-900/50 border border-red-700 text-white p-3 rounded-md mb-4">
                        <p className="text-sm">{error}</p>
                      </div>
                    )}
                    
                    {!session && !isLoading ? (
                      <div className="bg-zinc-800 p-4 rounded-md mb-4 text-center">
                        <p className="mb-3">You need to sign in before checking out</p>
                        <button 
                          onClick={handleSignIn}
                          className="bg-[#5865F2] hover:bg-[#4752c4] px-4 py-2 rounded-md transition-colors"
                        >
                          Sign In to Continue
                        </button>
                      </div>
                    ) : processing ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="h-6 w-6 border-2 border-t-green-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                        <span>Processing payment...</span>
                      </div>
                    ) : (
                      <div id="paypal-button-container" className="mt-4"></div>
                    )}
                    
                    <div className="mt-4 text-center text-sm text-zinc-500">
                      <p>Secure payment processed by PayPal</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 