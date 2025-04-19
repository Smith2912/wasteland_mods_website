"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '../context/CartContext';
import { loadScript } from '@paypal/paypal-js';
import { useRouter } from 'next/navigation';

export default function Cart({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { items, removeFromCart, clearCart, getCartTotal } = useCart();
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const router = useRouter();
  const total = getCartTotal();

  useEffect(() => {
    if (isOpen && !paypalLoaded && items.length > 0) {
      const loadPayPalScript = async () => {
        try {
          await loadScript({ 
            'client-id': process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb', 
            currency: 'USD'
          });
          setPaypalLoaded(true);
        } catch (error) {
          console.error('Failed to load PayPal JS SDK:', error);
        }
      };
      
      loadPayPalScript();
    }
  }, [isOpen, paypalLoaded, items.length]);

  useEffect(() => {
    if (paypalLoaded && items.length > 0) {
      // @ts-ignore
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
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
        onApprove: async (data: any, actions: any) => {
          const order = await actions.order.capture();
          console.log('Order completed successfully', order);
          
          // Handle successful payment
          // You would typically call your API here to record the purchase
          
          // Clear cart and redirect to success page
          clearCart();
          router.push('/checkout/success');
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
        }
      }).render('#paypal-button-container');
    }
  }, [paypalLoaded, items, total, clearCart, router]);

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
                    <div id="paypal-button-container" className="mt-4"></div>
                    
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