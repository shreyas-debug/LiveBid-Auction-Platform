import React from 'react';
import { createAuction } from '../services/api';

function HomePage() {
  const handleTestCreateAuction = async () => {
    try {
      // This test data matches our backend's 'Auction' model
      const testAuctionData = {
        itemName: "Test Auction from React",
        description: "This proves our token is working!",
        startingPrice: 50,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days from now
      };

      await createAuction(testAuctionData);
      alert('Auction created successfully!');

    } catch (error) {
      console.error(error);
      alert('Failed to create auction. Are you logged in?');
    }
  };

  return (
    <div>
      <h2>Welcome to the Home Page!</h2>
      <p>See all the active auctions here.</p>

      {/* Add a test button */}
      <button onClick={handleTestCreateAuction}>
        Test Create Auction (Must be logged in)
      </button>
    </div>
  );
}

export default HomePage;