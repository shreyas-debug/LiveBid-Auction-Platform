import React, { useState, useEffect } from 'react';
import { getMyBids } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

function UserProfilePage() {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getMyBids();
        setBids(response.data.$values || response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if(user) fetchHistory();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-l-4 border-indigo-600">
        <h1 className="text-3xl font-bold text-gray-900">Hello, {user?.username} 👋</h1>
        <p className="text-gray-600 mt-2">Manage your account and view your bidding history.</p>
      </div>

      <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bid History</h2>

      {loading ? (
        <p>Loading history...</p>
      ) : bids.length > 0 ? (
        <div className="bg-white rounded-xl shadow overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Your Bid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bids.map((bid) => (
                <tr key={bid.$id || bid.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {bid.auctionItemName || "Unknown Item"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                    ${bid.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bid.timestamp ? new Date(bid.timestamp).toLocaleDateString() : "Invalid Date"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link to={`/auctions/${bid.auctionId}`} className="text-indigo-600 hover:text-indigo-900">View Item</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">You haven't placed any bids yet.</p>
          <Link to="/" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">Start Exploring</Link>
        </div>
      )}
    </div>
  );
}

export default UserProfilePage;