import React, { useState, useEffect, useRef } from 'react';
import { getAuctions } from '../services/api';
import AuctionCard from '../components/AuctionCard';

function HomePage() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Refs for scrolling
  const auctionsRef = useRef(null);
  const featuresRef = useRef(null);

  const scrollToAuctions = () => auctionsRef.current?.scrollIntoView({ behavior: 'smooth' });
  const scrollToFeatures = () => featuresRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await getAuctions();
        // Handle potential $values wrapper from .NET or direct array
        setAuctions(response.data.$values || response.data); 
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  return (
    <div className="pb-20">
      {/* Modern Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden rounded-3xl mb-16 mx-4 lg:mx-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700 opacity-90"></div>
        {/* Background decorative circles */}
        <div className="absolute top-0 left-0 -mt-20 -ml-20 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 -mb-20 -mr-20 w-96 h-96 bg-purple-500 opacity-20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32 text-center z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
            Discover Rare Collectibles <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-pink-200">Bid in Real-Time.</span>
          </h1>
          <p className="mt-4 text-xl text-indigo-100 max-w-2xl mx-auto mb-10">
            The world's fastest growing marketplace for unique items. Join thousands of bidders and win your dream item today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button 
              onClick={scrollToAuctions}
              className="bg-white text-indigo-600 px-8 py-3.5 rounded-full font-bold hover:bg-indigo-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
            >
              Start Bidding
            </button>
            <button 
              onClick={scrollToFeatures}
              className="bg-indigo-800/50 backdrop-blur-sm border border-indigo-400/30 text-white px-8 py-3.5 rounded-full font-bold hover:bg-indigo-800/70 transition-all duration-200"
            >
              How it Works
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div ref={auctionsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Trending Auctions 🔥</h2>
            <p className="text-gray-500 mt-2 text-lg">Don't miss out on these ending soon items</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
               <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {auctions && auctions.length > 0 ? (
              auctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl">
                <p className="text-gray-500 text-lg">No active auctions found.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* How it Works Section (New) */}
      <div ref={featuresRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How LiveBid Works</h2>
          <p className="text-gray-500 mt-2">Three simple steps to win your first item</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
              📝
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">1. Register</h3>
            <p className="text-gray-500">Create a free account to unlock bidding access and track your favorite items.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
              💸
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">2. Place Bid</h3>
            <p className="text-gray-500">Find an item you love and place a bid. Watch in real-time as others compete.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">
              🏆
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">3. Win</h3>
            <p className="text-gray-500">If you have the highest bid when the timer ends, the item is yours!</p>
          </div>
        </div>
      </div>

    </div>
  );
}

export default HomePage;