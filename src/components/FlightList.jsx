import React from 'react';

export default function FlightList({ flights, onSelect }) {
  if (!flights || flights.length === 0) {
    return (
      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <p className="text-center text-gray-500">没有找到符合条件的航班</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">航班搜索结果</h2>
      <div className="space-y-4">
        {flights.map((flight) => (
          <div 
            key={flight.id} 
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onSelect(flight)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 flex items-center justify-center bg-blue-100 rounded-full">
                  <span className="text-blue-600 font-bold">{flight.airline.substring(0, 2)}</span>
                </div>
                <div>
                  <p className="font-medium">{flight.airline}</p>
                  <p className="text-sm text-gray-500">{flight.flightNumber}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-bold text-green-600">{flight.price} 元</span>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-center">
                <p className="text-lg font-bold">{flight.departureTime}</p>
                <p className="text-sm text-gray-500">{flight.from}</p>
              </div>
              
              <div className="flex-1 mx-4">
                <div className="relative">
                  <div className="border-t-2 border-gray-300"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-500">
                    {flight.duration}
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-lg font-bold">{flight.arrivalTime}</p>
                <p className="text-sm text-gray-500">{flight.to}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}