import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getAuctionById, placeBid } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSignalR } from '../context/SignalRContext';

function AuctionDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { connection, isConnected } = useSignalR();
  
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState(null);

  // Function to fetch initial data
  const fetchAuction = useCallback(async () => {
    try {
      const response = await getAuctionById(id);
      setAuction(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch auction details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // useEffect for initial data load
  useEffect(() => {
    setLoading(true);
    fetchAuction();
  }, [fetchAuction]);

  // This effect runs ONLY when the connection is fully established
  useEffect(() => {
    if (isConnected) {
      console.log("SignalR Page: Connection is 'Connected'. Setting up listeners.");
      
      connection.invoke("JoinAuctionGroup", id)
        .catch(e => console.error("Error joining group: ", e));
      connection.on("ReceiveNewBid", (newBid) => {
        console.log("New bid received!", newBid);

        setAuction(currentAuction => {
          if (!currentAuction) return null;
          return {
            ...currentAuction,
            currentPrice: newBid.amount,
            bids: {
              ...currentAuction.bids,
              $values: [newBid, ...(currentAuction.bids?.$values || [])]
            }
          };
        });
      });
      
      connection.on("UserJoined", (message) => {
        console.log(message);
      });
      
      connection.on("UserLeft", (message) => {
        console.log(message);
      });

      // Clean up when the component unmounts
      return () => {
        console.log("SignalR Page: Cleaning up listeners.");
        if (connection) {
          connection.invoke("LeaveAuctionGroup", id);
          connection.off("ReceiveNewBid");
          connection.off("UserJoined");
          connection.off("UserLeft");
        }
      };
    }
  }, [isConnected, connection, id]); // Re-run if any of these change

  // --- HandleSubmitBid function ---
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setBidError(null);
    const amount = parseFloat(bidAmount);

    if (isNaN(amount) || amount <= 0) {
      setBidError('Please enter a valid bid amount.');
      return;
    }

    try {
      await placeBid(id, amount);
      setBidAmount('');
      setBidError(null);
      // We don't call fetchAuction()! SignalR will handle the update.
    } catch (err) {
      console.error(err);
      const message = err.response?.data?.errors?.Amount || err.response?.data || 'Failed to place bid.';
      setBidError(message);
    }
  };

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!auction) return <div className="text-center py-10">Auction not found.</div>;

  const bids = auction.bids?.$values || [];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header / Breadcrumb could go here */}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT COLUMN: Image & Description */}
        <div>
          <div className="aspect-w-4 aspect-h-3 bg-gray-200 rounded-2xl overflow-hidden mb-6 flex items-center justify-center">
             {/* Placeholder Image */}
             <span className="text-9xl">🎁</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{auction.itemName}</h1>
            <div className="prose max-w-none text-gray-600">
              <p>{auction.description}</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Bidding Actions & History */}
        <div className="space-y-8">
          
          {/* Current Price Card */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-indigo-50">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Current Highest Bid</p>
            <p className="text-5xl font-extrabold text-indigo-600 mt-2">${auction.currentPrice}</p>
            <p className="text-sm text-gray-400 mt-2">Ends: {new Date(auction.endTime).toLocaleString()}</p>
            
            <div className="mt-8">
              {user ? (
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <div>
                    <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">Your Bid</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        type="number"
                        name="bidAmount"
                        id="bidAmount"
                        className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-lg py-3"
                        placeholder="0.00"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {bidError && <p className="text-sm text-red-600">{bidError}</p>}
                  <button 
                    type="submit" 
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    Place Bid
                  </button>
                </form>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                  <p className="text-gray-600">Please <a href="/login" className="text-indigo-600 font-bold hover:underline">log in</a> to place a bid.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bid History */}
          <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">Live Bid History</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {bids.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {bids.map((bid, index) => (
                    <li key={bid.$id || index} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition">
                      <div className="flex flex-col">
                         {/* In a real app, you'd show the bidder's name here */}
                        <span className="text-sm font-medium text-gray-900">Bidder</span> 
                        <span className="text-xs text-gray-500">{new Date(bid.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-700">${bid.amount}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-gray-500">No bids yet. Be the first!</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionDetailPage;