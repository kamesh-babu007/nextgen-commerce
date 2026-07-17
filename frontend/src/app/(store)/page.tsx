"use client";

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';
import { useCart } from '../../lib/CartContext';
import CartSidebar from '../../components/CartSidebar';

export default function StoreHome() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const { addToCart, setIsCartOpen, items } = useCart();

  const loadProducts = async () => {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await fetchWithAuth(`/store/products${query}`);
      if (Array.isArray(data)) {
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to load products', e);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-10 bg-background relative">
      <header className="w-full max-w-6xl flex justify-between items-center mb-10 pb-6 border-b border-secondary border-opacity-30">
        <h1 className="text-4xl font-bold text-neon-secondary text-secondary uppercase tracking-widest">
          NextGen Marketplace
        </h1>
        <div className="flex gap-4 items-center">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-6 py-2 box-neon-secondary bg-gray-900 bg-opacity-80 text-white font-mono text-sm uppercase hover:bg-secondary hover:text-black transition-colors"
          >
            <span>Neural Cart</span>
            <span className="bg-secondary text-black px-2 py-0.5 rounded-full font-bold">
              {items.reduce((acc, i) => acc + i.quantity, 0)}
            </span>
          </button>
          <a href="/auth" className="text-sm font-mono text-cyan-400 hover:text-white uppercase">Identity</a>
        </div>
      </header>

      <div className="w-full max-w-6xl mb-12">
        <input 
          type="text" 
          placeholder="SEARCH AUGMENTATIONS..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xl bg-black border border-secondary text-white px-6 py-4 focus:outline-none box-neon-secondary transition-all font-mono uppercase text-sm tracking-widest placeholder-gray-600"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full max-w-6xl">
        {products.map((product) => (
          <div key={product.id} className="box-neon-secondary flex flex-col p-5 rounded-lg bg-gray-900 bg-opacity-60 hover:bg-opacity-100 transition-all duration-300">
            <div className="w-full h-48 bg-black border border-gray-800 mb-4 flex items-center justify-center overflow-hidden">
              <img src={`https://picsum.photos/seed/${product.id}/400/300`} alt={product.name} className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">{product.name}</h2>
            <p className="text-cyan-200 opacity-70 mb-4 text-sm flex-1">{product.description || 'Military-grade enhancement.'}</p>
            
            <div className="flex justify-between items-center mb-4">
              <span className="text-accent font-bold text-xl">₹{product.price.toLocaleString('en-IN')}</span>
              <span className={`text-xs font-mono px-2 py-1 ${product.stock_quantity > 10 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                STOCK: {product.stock_quantity}
              </span>
            </div>
            
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stock_quantity <= 0}
              className="w-full py-3 box-neon-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300 font-bold uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-primary"
            >
              Add to Cart
            </button>
          </div>
        ))}
        {products.length === 0 && (
          <div className="col-span-full text-center py-20 text-gray-500 font-mono uppercase tracking-widest">
            No augmentations found.
          </div>
        )}
      </div>

      <CartSidebar />
    </main>
  );
}
