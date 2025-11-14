import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAuctionById } from '../services/api';

function AuctionDetailPage() {
  const { id } = useParams(); // Get the auction ID from the URL
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        setLoading(true);
        const response = await getAuctionById(id);
        setAuction(response.data); // This is the auction object
        setError(null);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch auction details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, [id]); // The [id] means "re-run this effect if the id in the URL changes"

  // Show loading/error messages
  if (loading) return <p>Loading auction...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!auction) return <p>Auction not found.</p>;

  // This is the logic to correctly find the bids list
  // The serializer wraps lists that have potential cycles.
  const bids = auction.bids?.$values || [];

  return (
    <div>
      <h2>{auction.itemName}</h2>
      <p>{auction.description}</p>
      <h3>
        Current Price: ${auction.currentPrice}
      </h3>
      <p>
        <strong>Ends:</strong> {new Date(auction.endTime).toLocaleString()}
      </p>

      {/* We'll build this form in the next step */}
      <div className="bidding-form">
        <h4>Place Your Bid</h4>
        <input type="number" placeholder="Your bid amount" />
        <button>Submit Bid</button>
      </div>

      <div className="bid-history">
        <h4>Bid History</h4>
        {bids.length > 0 ? (
          <ul>
            {bids.map((bid, index) => (
              <li key={bid.$id || index}> {/* Use $id or index as a fallback key */}
                ${bid.amount} at {new Date(bid.timestamp).toLocaleString()}
              </li>
            ))}
          </ul>
        ) : (
          <p>No bids yet.</p>
        )}
      </div>
    </div>
  );
}

export default AuctionDetailPage;