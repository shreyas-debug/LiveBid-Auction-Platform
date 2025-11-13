import React from 'react';
import { useParams } from 'react-router-dom';

function AuctionDetailPage() {
  // The useParams hook reads the ':id' from the URL
  const { id } = useParams();

  return (
    <div>
      <h2>Auction Details</h2>
      <p>Details for auction {id} will go here.</p>
    </div>
  );
}

export default AuctionDetailPage;