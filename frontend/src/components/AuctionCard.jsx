import React from 'react';
import { Link } from 'react-router-dom';

function AuctionCard({ auction }) {
  // Calculate if auction is active
  const isActive = new Date(auction.endTime) > new Date();

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
      {/* Placeholder for an image - you could add image URLs to your DB later */}
      <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
         <span className="text-4xl">📦</span>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-1">{auction.itemName}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isActive ? 'Active' : 'Ended'}
          </span>
        </div>

        <p className="mt-2 text-gray-600 text-sm line-clamp-2">{auction.description}</p>

        <div className="mt-auto pt-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold">Current Price</p>
              <p className="text-2xl font-bold text-indigo-600">${auction.currentPrice}</p>
            </div>
            <Link 
              to={`/auctions/${auction.id}`}
              className="inline-block bg-gray-900 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition"
            >
              Bid Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuctionCard;