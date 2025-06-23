import React from 'react';
import { useNavigate } from 'react-router-dom';

function BookingCard({ booking, type }) {
  const navigate = useNavigate();
  const departureDate = new Date(booking.flight.departureDate);
  const formattedDate = departureDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="flex p-6">
        <div className="w-1/2">
          <div className="mb-4">
            <h3 className="font-bold text-lg">{booking.flight.airline.name}</h3>
            <p className="text-gray-600">Booking Ref: {booking.reference}</p>
          </div>
          <div className="mb-4">
            <p className="text-xl font-bold">{booking.flight.departure.city} to {booking.flight.arrival.city}</p>
            <p className="text-gray-600">{formattedDate}</p>
          </div>
          <div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
              onClick={() => navigate(`/flights/${booking.flight.id}`)}
            >
              View Details
            </button>
          </div>
        </div>
        <div className="w-1/2">
          <img
            src={booking.flight.image}
            alt="Flight"
            className="w-full h-40 object-cover rounded-r-xl"
          />
        </div>
      </div>
    </div>
  );
}

export default BookingCard;