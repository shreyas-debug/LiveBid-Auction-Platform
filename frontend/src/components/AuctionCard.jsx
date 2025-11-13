import React from 'react';
import { Link } from 'react-router-dom';

// A simple component to display auction info
function AuctionCard({ auction }) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '16px', margin: '16px' }}>
      <h3>{auction.itemName}</h3>
      <p>{auction.description}</p>
      <p>
        <strong>Current Price:</strong> ${auction.currentPrice}
      </p>
      <p>
        <strong>Ends:</strong> {new Date(auction.endTime).toLocaleString()}
      </p>
      <Link to={`/auctions/${auction.id}`}>View Details</Link>
    </div>
  );
}

export default AuctionCard;