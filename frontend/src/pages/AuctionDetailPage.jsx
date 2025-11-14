import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getAuctionById, placeBid } from '../services/api'; //Import placeBid
import { useAuth } from '../context/AuthContext'; //Import useAuth to check if user is logged in

function AuctionDetailPage() {
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // --- Add state for our new form ---
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState(null);
  const { user } = useAuth(); // Get the current user

  // This function fetches the auction data
  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await getAuctionById(id);
      setAuction(response.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch auction details.');
    } finally {
      setLoading(false);
    }
  };

  //Run the fetch function when the component loads
  useEffect(() => {
    fetchAuction();
  }, [id]); // [id] means "re-run this if the id in the URL changes"

  // --- Create the form submission handler ---
  const handleSubmitBid = async (e) => {
    e.preventDefault();
    setBidError(null);

    // Convert the bidAmount to a number
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      setBidError('Please enter a valid bid amount.');
      return;
    }

    try {
      // Call our new API function
      await placeBid(id, amount);
      
      // SUCCESS!
      setBidAmount(''); // Clear the input box
      setBidError(null);
      alert('Bid placed successfully!');
      
      //Refresh the auction data to show the new price and bid history
      fetchAuction(); 

    } catch (err) {
      console.error(err);
      // Get the error message from the backend (e.g., "Bid must be higher")
      const message = err.response?.data?.errors?.Amount || err.response?.data || 'Failed to place bid.';
      setBidError(message);
    }
  };

  // ... (loading/error messages)
  if (loading) return <p>Loading auction...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!auction) return <p>Auction not found.</p>;

  const bids = auction.bids?.$values || [];

  return (
    <div>
      <h2>{auction.itemName}</h2>
      <p>{auction.description}</p>
      <h3>Current Price: ${auction.currentPrice}</h3>
      <p><strong>Ends:</strong> {new Date(auction.endTime).toLocaleString()}</p>

      {user ? ( // Only show the form if the user is logged in
        <form className="bidding-form" onSubmit={handleSubmitBid}>
          <h4>Place Your Bid</h4>
          <input
            type="number"
            placeholder="Your bid amount"
            value={bidAmount}
            onChange={(e) => setBidAmount(e.target.value)}
            required
          />
          <button type="submit">Submit Bid</button>
          {bidError && <p style={{ color: 'red' }}>{bidError}</p>}
        </form>
      ) : (
        <p>Please log in to place a bid.</p>
      )}

      {/* ... (existing bid history section) ... */}
      <div className="bid-history">
        <h4>Bid History</h4>
        {bids.length > 0 ? (
          <ul>
            {bids.map((bid, index) => (
              <li key={bid.$id || index}>
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