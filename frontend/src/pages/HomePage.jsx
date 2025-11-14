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
      <h2>Active Auctions</h2>

      {loading && <p>Loading auctions...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && !error && (
        <div className="auction-list">
          {auctions.map((auction) => (
            //Map over the state and render a card for each auction
            <AuctionCard key={auction.id} auction={auction} />
          ))}
        </div>
      )}
    </div>
  );
}

export default HomePage;