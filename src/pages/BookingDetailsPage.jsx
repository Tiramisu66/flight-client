import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDateTime } from '../utils/formatDate';
import { formatPrice } from '../utils/formatPrice';

const FlightDetails = ({ flight, isReturnFlight = false }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    <h4 className="text-lg font-medium text-gray-900 mb-4">
      {isReturnFlight ? 'Return Flight Details' : 'Outbound Flight Details'}
    </h4>
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-sm text-gray-500">Departure</p>
        <p className="text-base font-medium">{formatDateTime(flight.departureTime)}</p>
        <p className="text-sm text-gray-600">{flight.departureAirport?.name || flight.departure}</p>
      </div>
      <div className="flex-1 mx-4 border-t border-gray-300 border-dashed relative">
        <div className="absolute inset-y-0 left-0 flex items-center justify-center w-3 h-3 -mt-1.5 rounded-full bg-blue-500" />
        <div className="absolute inset-y-0 right-0 flex items-center justify-center w-3 h-3 -mt-1.5 rounded-full bg-blue-500" />
      </div>
      <div className="text-right">
        <p className="text-sm text-gray-500">Arrival</p>
        <p className="text-base font-medium">{formatDateTime(flight.arrivalTime)}</p>
        <p className="text-sm text-gray-600">{flight.arrivalAirport?.name || flight.destination}</p>
      </div>
    </div>
  </div>
);

const BookingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getBookingById } = useBooking();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const data = await getBookingById(id);
        setBooking(data);
      } catch (err) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id, getBookingById]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <ErrorMessage message={error} className="mb-6" />
          <button
            onClick={() => navigate('/bookings')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const calculateSubtotal = () => {
    const passengerCount = booking.bookingPassengers ? booking.bookingPassengers.length : 0;
    let subtotal = booking.flight.price * passengerCount;
    if (booking.returnFlight) {
      subtotal += booking.returnFlight.price * passengerCount;
    }
    return subtotal;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Booking Details</h1>
          <button
            onClick={() => navigate('/bookings')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to My Bookings
          </button>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          {/* Booking Header */}
          <div className="px-6 py-4 bg-blue-50">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Booking Reference: <span className="font-medium">{booking.reference}</span>
                </h3>
                <p className="text-sm text-gray-600">
                  {booking.returnFlight ? 'Round Trip' : 'One Way'}
                </p>
              </div>
              <div className="text-sm text-gray-600">
                Booked on {formatDateTime(booking.createdAt)}
              </div>
            </div>
          </div>

          {/* Main Flight Details */}
          <FlightDetails 
            flight={booking.flight} 
            isReturnFlight={booking.mainFlightType === 'RETURN'} 
          />

          {/* Return Flight Details (if exists) */}
          {booking.returnFlight && (
            <FlightDetails 
              flight={booking.returnFlight} 
              isReturnFlight={true} 
            />
          )}

          {/* Passenger Information */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Passenger Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {booking.bookingPassengers && booking.bookingPassengers.map((bookingPassenger, index) => {
                const passenger = bookingPassenger.passenger;
                return (
                  <div key={bookingPassenger.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {passenger.firstName} {passenger.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{passenger.email}</p>
                    {passenger.phone && (
                      <p className="text-sm text-gray-600">{passenger.phone}</p>
                    )}
                    {bookingPassenger.seatPreference && (
                      <p className="text-sm text-gray-600 mt-2">
                        Seat Preference: {bookingPassenger.seatPreference}
                      </p>
                    )}
                    {bookingPassenger.specialRequirements && (
                      <p className="text-sm text-gray-600">
                        Special Requirements: {bookingPassenger.specialRequirements}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Summary */}
          <div className="px-6 py-4">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Price Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Base Price ({booking.bookingPassengers ? booking.bookingPassengers.length : 0} passengers)</span>
                <span>{formatPrice(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxes & Fees</span>
                <span>{formatPrice(booking.totalPrice - calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900 pt-2 border-t">
                <span>Total Price</span>
                <span>{formatPrice(booking.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsPage;
