"use client";

import { useEffect, useState } from 'react';
import { fetchWithAuth } from '../../lib/api';

export default function AdminHub() {
  const [products, setProducts] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({ revenue: 0, activeOrders: 0, completedTransactions: 0 });
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: '', description: '', price: '', stock_quantity: '' });

  const loadData = async () => {
    setLoading(true);
    try {
      const dashboard = await fetchWithAuth('/v1/admin/dashboard');
      if (dashboard?.data) setMetrics(dashboard.data);

      const prods = await fetchWithAuth('/v1/admin/products');
      if (Array.isArray(prods)) setProducts(prods);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await fetchWithAuth(`/v1/admin/products/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(formData),
        });
      } else {
        await fetchWithAuth('/v1/admin/products', {
          method: 'POST',
          body: JSON.stringify(formData),
        });
      }
      setIsEditing(false);
      loadData();
    } catch (e: any) {
      alert('Save failed: ' + e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await fetchWithAuth(`/v1/admin/products/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e: any) {
      alert('Delete failed: ' + e.message);
    }
  };

  const openForm = (product: any = null) => {
    if (product) {
      setFormData({ 
        name: product.name, 
        description: product.description || '', 
        price: String(product.price), 
        stock_quantity: String(product.stock_quantity) 
      });
      setEditingId(product.id);
    } else {
      setFormData({ name: '', description: '', price: '', stock_quantity: '' });
      setEditingId(null);
    }
    setIsEditing(true);
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-cyan-400 font-mono text-xl uppercase">Initializing System...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-10 bg-[#0a0a0c]">
      <header className="w-full max-w-7xl flex justify-between items-center mb-10 pb-4 border-b border-primary border-opacity-30">
        <h1 className="text-3xl font-bold text-neon-primary text-primary uppercase tracking-widest">
          Vendor & Admin Hub
        </h1>
        <div className="flex gap-4 items-center">
          <span className="text-white bg-gray-800 px-4 py-1 rounded text-sm font-mono border border-gray-700">Access: Level 4</span>
          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/auth'; }}
            className="text-sm font-mono text-cyan-400 hover:text-white uppercase"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full max-w-7xl mb-12">
        <section className="col-span-1 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="box-neon-secondary p-6 bg-gray-900 bg-opacity-80">
            <h3 className="text-cyan-400 font-mono text-sm mb-2 uppercase">Gross Order Totals</h3>
            <p className="text-4xl font-bold text-white">₹{metrics.revenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="box-neon-secondary p-6 bg-gray-900 bg-opacity-80">
            <h3 className="text-cyan-400 font-mono text-sm mb-2 uppercase">Active Pipelines</h3>
            <p className="text-4xl font-bold text-white">{metrics.activeOrders}</p>
          </div>
          <div className="box-neon-secondary p-6 bg-gray-900 bg-opacity-80">
            <h3 className="text-cyan-400 font-mono text-sm mb-2 uppercase">Completed Transactions</h3>
            <p className="text-4xl font-bold text-white">{metrics.completedTransactions}</p>
          </div>
        </section>
      </div>

      <div className="w-full max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-mono text-white uppercase tracking-wider border-l-4 border-primary pl-4">Inventory Operations</h2>
          <button 
            onClick={() => openForm()}
            className="px-6 py-2 box-neon-primary bg-primary bg-opacity-20 text-white font-mono uppercase hover:bg-opacity-50 transition-colors"
          >
            + Create Asset
          </button>
        </div>

        {isEditing && (
          <div className="mb-10 p-6 box-neon-secondary bg-gray-900 bg-opacity-90 rounded">
            <h3 className="text-cyan-400 font-mono mb-4 uppercase">{editingId ? 'Modify Asset' : 'Deploy New Asset'}</h3>
            <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-1 uppercase">Asset Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black border border-gray-700 text-white px-3 py-2 font-mono" />
              </div>
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-1 uppercase">Unit Price (₹)</label>
                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-black border border-gray-700 text-white px-3 py-2 font-mono" />
              </div>
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-1 uppercase">Stock Level</label>
                <input required type="number" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value})} className="w-full bg-black border border-gray-700 text-white px-3 py-2 font-mono" />
              </div>
              <div>
                <label className="block text-gray-400 font-mono text-xs mb-1 uppercase">Description (Optional)</label>
                <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-gray-700 text-white px-3 py-2 font-mono" />
              </div>
              <div className="md:col-span-2 flex gap-4 mt-2">
                <button type="submit" className="px-6 py-2 bg-secondary text-black font-bold uppercase tracking-wider hover:bg-white transition-colors">
                  Submit
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-2 border border-gray-600 text-gray-400 uppercase tracking-wider hover:text-white transition-colors font-mono">
                  Abort
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="w-full overflow-x-auto border border-gray-800">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black bg-opacity-50">
                <th className="p-4 border-b border-gray-800 text-cyan-500 font-mono text-xs uppercase">ID</th>
                <th className="p-4 border-b border-gray-800 text-cyan-500 font-mono text-xs uppercase">Name</th>
                <th className="p-4 border-b border-gray-800 text-cyan-500 font-mono text-xs uppercase">Price</th>
                <th className="p-4 border-b border-gray-800 text-cyan-500 font-mono text-xs uppercase">Stock</th>
                <th className="p-4 border-b border-gray-800 text-cyan-500 font-mono text-xs uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-900 hover:bg-opacity-50 transition-colors">
                  <td className="p-4 border-b border-gray-800 text-gray-500 font-mono text-xs">{p.id.split('-')[0]}...</td>
                  <td className="p-4 border-b border-gray-800 text-white font-mono">{p.name}</td>
                  <td className="p-4 border-b border-gray-800 text-accent font-mono">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="p-4 border-b border-gray-800 text-white font-mono">
                    <span className={`px-2 py-1 rounded ${p.stock_quantity > 0 ? 'bg-green-900 bg-opacity-50 text-green-400' : 'bg-red-900 bg-opacity-50 text-red-400'}`}>
                      {p.stock_quantity}
                    </span>
                  </td>
                  <td className="p-4 border-b border-gray-800 text-white font-mono flex gap-4">
                    <button onClick={() => openForm(p)} className="text-secondary hover:text-white uppercase text-xs">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-primary hover:text-white uppercase text-xs">Purge</button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-mono uppercase tracking-widest">
                    No active assets in the registry.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
