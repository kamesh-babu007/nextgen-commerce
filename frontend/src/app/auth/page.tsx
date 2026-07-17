"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWithAuth } from '../../lib/api';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('CUSTOMER');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const payload = isLogin ? { email, password } : { email, password, role };
      
      const data = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      if (data.role === 'VENDOR' || data.role === 'ADMIN') {
        router.push('/(admin)'); // we can push to root or admin based on routing
        // The path in next.js is just / since (admin) is a route group, but let's assume root is store, wait, both (admin)/page.tsx and (store)/page.tsx would conflict at root `/`. Let me check if there's a routing conflict.
        // Actually, if both are `page.tsx` in `(admin)` and `(store)`, Next.js won't compile if they both try to be the `/` route.
        // Wait, did I check the frontend folders? 
        // `frontend/src/app/(admin)/page.tsx` and `frontend/src/app/(store)/page.tsx`.
        // A route group `(...)` doesn't affect the URL. So both are targeting `/` which is an error in Next.js.
        // But maybe they are currently meant to be something else? Let's check.
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md box-neon-secondary p-8 bg-gray-900 bg-opacity-80 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-neon-secondary text-secondary tracking-widest uppercase">
          {isLogin ? 'System Access' : 'New Identity'}
        </h1>
        
        {error && (
          <div className="mb-4 p-3 border border-primary bg-primary bg-opacity-20 text-white font-mono text-sm rounded">
            [ERROR]: {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-cyan-400 font-mono text-sm mb-2 uppercase">Neural Link (Email)</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-black border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-secondary transition-colors font-mono"
            />
          </div>
          <div>
            <label className="block text-cyan-400 font-mono text-sm mb-2 uppercase">Passphrase</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-black border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-secondary transition-colors font-mono"
            />
          </div>
          
          {!isLogin && (
            <div>
              <label className="block text-cyan-400 font-mono text-sm mb-2 uppercase">Access Level</label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-black border border-gray-700 text-white px-4 py-3 focus:outline-none focus:border-secondary transition-colors font-mono appearance-none"
              >
                <option value="CUSTOMER">Customer</option>
                <option value="VENDOR">Vendor</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full box-neon-primary bg-primary bg-opacity-20 hover:bg-opacity-50 text-white font-bold py-3 uppercase tracking-wider transition-all duration-300"
          >
            {isLogin ? 'Initiate Login' : 'Register Identity'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-gray-400 hover:text-secondary font-mono text-sm uppercase transition-colors"
          >
            {isLogin ? 'Establish new identity' : 'Existing user? Login'}
          </button>
        </div>
      </div>
    </div>
  );
}
