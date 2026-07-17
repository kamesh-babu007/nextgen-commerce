"use client";

import React from 'react';
import { useCart } from '../lib/CartContext';
import { useRouter } from 'next/navigation';

export default function CartSidebar() {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, checkout } = useCart();
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  if (!isCartOpen) return null;

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/auth');
      return;
    }
    
    setLoading(true);
    try {
      await checkout();
      alert('Checkout successful!');
    } catch (e: any) {
      alert('Checkout failed: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={() => setIsCartOpen(false)}
      ></div>
      <div className="relative w-full max-w-md bg-gray-900 border-l border-primary h-full flex flex-col box-neon-secondary shadow-2xl">
        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-black bg-opacity-40">
          <h2 className="text-2xl font-bold text-secondary uppercase tracking-widest text-neon-secondary">Neural Cart</h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 hover:text-white font-mono"
          >
            [CLOSE]
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <p className="text-gray-500 font-mono text-center mt-10 uppercase">Cart is empty</p>
          ) : (
            items.map(item => (
              <div key={item.productId} className="flex flex-col gap-2 p-4 bg-black border border-gray-800 rounded">
                <div className="flex justify-between">
                  <span className="font-bold text-white">{item.name}</span>
                  <span className="text-accent font-bold">₹{item.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center bg-gray-800 text-white font-mono hover:bg-gray-700"
                    >-
                    </button>
                    <span className="font-mono text-white w-8 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center bg-gray-800 text-white font-mono hover:bg-gray-700"
                    >+
                    </button>
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.productId)}
                    className="text-xs font-mono text-primary hover:text-red-400 uppercase"
                  >
                    Remove
                  </button>
                </div>
                <div className="text-xs font-mono text-gray-500 text-right mt-1">
                  Subtotal: ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-gray-800 bg-black">
            <div className="flex justify-between items-center mb-6">
              <span className="text-gray-400 font-mono uppercase">Gross Total</span>
              <span className="text-2xl font-bold text-accent">₹{total.toLocaleString('en-IN')}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full box-neon-primary bg-primary bg-opacity-20 hover:bg-opacity-50 text-white font-bold py-4 uppercase tracking-wider transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Complete Transaction'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
