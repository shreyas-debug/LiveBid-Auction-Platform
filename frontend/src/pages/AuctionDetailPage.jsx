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

  if (loading) return <p>Loading auction...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!auction) return <p>Auction not found.</p>;

  const bids = auction.bids?.$values || [];

  return (
    <div>
      <h2>{auction.itemName}</h2>
      {user ? (
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