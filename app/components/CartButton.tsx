"use client";

import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import Cart from './Cart';

export default function CartButton() {
  const { getItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const itemCount = getItemCount();

  return (
    <>
      <button
        onClick={() => setIsCartOpen(true)}
        className="flex items-center space-x-1 px-3 py-2 bg-red-700 hover:bg-red-800 rounded-md transition-colors relative"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <span>Cart</span>
        
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>
      
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
} 