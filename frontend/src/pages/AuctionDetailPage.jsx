import React, { useState, useEffect, useCallback, useRef } from 'react';
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

  // Scroll ref
  const historyEndRef = useRef(null);
  const scrollToBottom = () => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom() }, [auction?.bids]);

  // 1. Fetch Logic
  const fetchAuction = useCallback(async () => {
    console.log("Fetching auction...", id); // DEBUG LOG
    try {
      const response = await getAuctionById(id);
      console.log("Auction fetched:", response.data); // DEBUG LOG
      
      // Handle potential $values wrapper
      setAuction(response.data);
      setError(null);
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Failed to load auction. Check console.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // 2. Initial Load
  useEffect(() => {
    setLoading(true);
    fetchAuction();
  }, [fetchAuction]);

  // 3. SignalR Logic
  useEffect(() => {
    if (isConnected && connection) {
      console.log("SignalR: Joining group for", id);
      connection.invoke("JoinAuctionGroup", id).catch(console.error);

      connection.on("ReceiveNewBid", (newBid) => {
        console.log("New bid received!", newBid);
        setAuction(prev => {
          if (!prev) return null;
          return {
            ...prev,
            currentPrice: newBid.amount,
            bids: {
              ...prev.bids,
              $values: [newBid, ...(prev.bids?.$values || [])]
            }
          };
        });
      });

      return () => {
        if (connection.state === "Connected") {
           connection.invoke("LeaveAuctionGroup", id).catch(console.error);
        }
        connection.off("ReceiveNewBid");
      };
    }
  }, [isConnected, connection, id]);

  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setBidError(null);
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      await placeBid(id, amount);
      setBidAmount('');
    } catch (err) {
      console.error(err);
      setBidError(err.response?.data?.errors?.Amount || err.response?.data || 'Failed.');
    }
  };

  // --- Render ---
  if (loading) return <div className="text-center py-20 text-xl">Loading auction data...</div>;
  if (error) return <div className="text-center py-20 text-red-600 text-xl">{error}</div>;
  if (!auction) return <div className="text-center py-20 text-gray-500 text-xl">Auction not found.</div>;

  // Safe access to bids
  const bids = auction.bids?.$values || [];
  const isSoldOut = auction.isSoldOut;
  const winningBidder = auction.winningBidder;
  const winningBidAmount = auction.winningBidAmount;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="aspect-video bg-gray-100 rounded-3xl flex items-center justify-center border border-gray-200 shadow-inner overflow-hidden">
          {auction.imageUrl ? (
            <img 
              src={auction.imageUrl} 
              alt={auction.itemName} 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-9xl select-none animate-bounce-slow">🎁</span>
          )}
          </div>
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900">{auction.itemName}</h1>
            <p className="text-lg text-gray-600 mt-4">{auction.description}</p>
          </div>

          {/* Live Feed */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="font-bold text-gray-800">Live Activity</h3>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {bids.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {bids.map((bid, index) => (
                    <div key={bid.$id || index} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors duration-150">
                      <div className="flex flex-col">
                        {/* SHOW USERNAME HERE */}
                        <span className="text-sm font-bold text-indigo-900">
                          {bid.bidderUsername || 'Anonymous'}
                        </span> 
                        <span className="text-xs text-gray-500">{new Date(bid.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-lg font-bold text-gray-700 font-mono">${bid.amount}</span>
                    </div>
                  ))}
                  <div ref={historyEndRef} />
                </div>
              ) : (
                <div className="p-12 text-center text-gray-400">No bids yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Sticky Bid Panel */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-white p-8 rounded-3xl shadow-xl border border-indigo-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase">
                  {isSoldOut ? 'Final Price' : 'Current Price'}
                </p>
                <p className="text-5xl font-extrabold text-indigo-600 mt-1">
                  ${auction.currentPrice}
                </p>
              </div>
              {isSoldOut && (
                <span className="inline-flex items-center px-3 py-1 text-sm font-semibold text-red-700 bg-red-50 border border-red-100 rounded-full">
                  Sold Out
                </span>
              )}
            </div>
            
            <div className="mt-8">
              {isSoldOut ? (
                <div className="space-y-2 bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                  <p className="text-lg font-bold text-gray-800">Auction Ended</p>
                  <p className="text-gray-600">
                    {winningBidder
                      ? <>Won by <span className="font-semibold">{winningBidder}</span></>
                      : 'Highest bidder information unavailable.'}
                  </p>
                  {winningBidAmount && (
                    <p className="text-gray-600">
                      Winning Bid: <span className="font-semibold">${winningBidAmount}</span>
                    </p>
                  )}
                </div>
              ) : user ? (
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="block w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl font-bold"
                    placeholder="Enter amount"
                    required
                  />
                  <button className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition">
                    Place Bid
                  </button>
                  {bidError && <p className="text-red-500 text-sm text-center">{bidError}</p>}
                </form>
              ) : (
                <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <a href="/login" className="text-indigo-600 font-bold">Log in to bid</a>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AuctionDetailPage;