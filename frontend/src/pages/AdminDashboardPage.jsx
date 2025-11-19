import React, { useState, useEffect } from 'react';
import { getAuctions, createAuction, deleteAuction } from '../services/api';

function AdminDashboardPage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    startingPrice: '',
    imageUrl: '',
    endTime: '', // We will use datetime-local input
  });
  const [error, setError] = useState(null);

  // 1. Fetch all auctions on load
  const fetchAuctions = async () => {
    try {
      const response = await getAuctions();
      setAuctions(response.data.$values || response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  // 2. Handle Create
  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Prepare the data for the backend
      const payload = {
        ...formData,
        startingPrice: parseFloat(formData.startingPrice),
        startTime: new Date().toISOString(), // Start now
        endTime: new Date(formData.endTime).toISOString(),
      };

      await createAuction(payload);
      
      // Reset form and refresh list
      setFormData({ itemName: '', description: '', startingPrice: '', imageUrl: '', endTime: '' });
      alert("Auction created successfully!");
      fetchAuctions();

    } catch (err) {
      console.error(err);
      setError("Failed to create auction. Ensure you are an Admin.");
    }
  };

  // 3. Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this auction?")) return;

    try {
      await deleteAuction(id);
      // Remove from UI immediately
      setAuctions(auctions.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete. Ensure you are an Admin.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">🛠️ Admin Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COL: Create Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Item</h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Item Name</label>
                <input 
                  type="text" 
                  required 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                  value={formData.itemName}
                  onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                  required 
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-3 border"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Price</label>
                  <div className="relative mt-1">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                    <input 
                      type="number" 
                      required 
                      className="block w-full pl-7 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 border"
                      value={formData.startingPrice}
                      onChange={(e) => setFormData({...formData, startingPrice: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input 
                    type="datetime-local" 
                    required 
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 px-2 border text-sm"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 font-bold transition shadow-md">
                Create Auction
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COL: List of Auctions */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="font-bold text-gray-800">Manage Inventory ({auctions.length})</h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {auctions.map((auction) => (
                  <div key={auction.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="h-12 w-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                        {auction.imageUrl ? (
                          <img src={auction.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">📦</div>
                        )}
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">{auction.itemName}</h3>
                        <p className="text-xs text-gray-500">
                          Ends: {new Date(auction.endTime).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-mono font-medium text-gray-600">
                        ${auction.currentPrice}
                      </span>
                      <button 
                        onClick={() => handleDelete(auction.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 hover:bg-red-50 rounded-md transition"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {auctions.length === 0 && (
                  <div className="p-8 text-center text-gray-400">No auctions found.</div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboardPage;