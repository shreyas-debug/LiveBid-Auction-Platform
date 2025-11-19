import React, { useState, useEffect } from 'react';
import { getAuctions } from '../services/api';
import AuctionCard from '../components/AuctionCard';

function HomePage() {
  //Create state to hold our list of auctions
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //useEffect runs once when the component mounts
  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        //Call the API function from api.js
        const response = await getAuctions();
        setAuctions(response.data.$values); //Save the auctions to state
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch auctions.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []); // The empty array [] means "run this only once"

  //Render the component's UI
  return (
    <div>
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
          Live Auctions
        </h2>
        <p className="mt-4 text-lg text-gray-500">
          Discover unique items and bid in real-time.
        </p>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center">{error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {auctions && auctions.map((auction) => (
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;