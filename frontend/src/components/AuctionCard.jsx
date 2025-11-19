import React from 'react';
import { Link } from 'react-router-dom';

function AuctionCard({ auction }) {
  const isActive = new Date(auction.endTime) > new Date();
  
  return (
    <Link to={`/auctions/${auction.id}`} className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        
        {/* Image Area */}
        <div className="relative h-64 bg-gray-100 group-hover:bg-gray-50 transition-colors flex items-center justify-center overflow-hidden">
           {auction.imageUrl ? (
             <img 
               src={auction.imageUrl} 
               alt={auction.itemName} 
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
             />
           ) : (
             <span className="text-6xl group-hover:scale-110 transition-transform duration-500">📦</span>
           )}
           
           {/* Floating Badge */}
           <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-gray-100 z-10">
             {isActive ? '🟢 Live' : '🔴 Ended'}
           </div>
        </div>
        
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {auction.itemName}
          </h3>
          <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-grow">
            {auction.description}
          </p>
          
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Current Price</p>
              <p className="text-xl font-bold text-indigo-600">${auction.currentPrice}</p>
            </div>
            {/* Arrow Icon */}
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default AuctionCard;