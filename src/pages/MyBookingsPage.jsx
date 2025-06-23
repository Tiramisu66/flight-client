import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDateTime } from '../utils/formatDate';
import { formatPrice } from '../utils/formatPrice';
import { cancelBooking } from '../services/bookingApi';

const BookingStatus = ({ status }) => {
  const getStatusColor = () => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
      {status}
    </span>
  );
};

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { bookings, loading, error, loadBookings, getUpcomingBookings, getPastBookings } = useBooking();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingBookingId, setCancellingBookingId] = useState(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/bookings' } });
      return;
    }

    loadBookings();
  }, [isAuthenticated, navigate, loadBookings]);

  const displayBookings = activeTab === 'upcoming' ? getUpcomingBookings() : getPastBookings();

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowCancelDialog(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    setCancellingBookingId(bookingToCancel.id);
    setShowCancelDialog(false);
    
    try {
      await cancelBooking(bookingToCancel.id);
      
      // Navigate to cancellation confirmation page
      navigate('/booking-cancelled', {
        state: { totalPrice: bookingToCancel.totalPrice }
      });
      
      // Reload bookings to reflect the change
      await loadBookings();
    } catch (err) {
      console.error('Cancel booking error:', err);
    } finally {
      setCancellingBookingId(null);
      setBookingToCancel(null);
    }
  };

  const cancelCancelBooking = () => {
    setShowCancelDialog(false);
    setBookingToCancel(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && bookingToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Cancel Booking</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to cancel this booking?
            </p>
            <div className="mb-4">
              <p className="text-sm text-gray-600">Booking Reference: {bookingToCancel.bookingReference}</p>
              <p className="text-sm text-gray-600">Refund Amount: {formatPrice(bookingToCancel.totalPrice)}</p>
            </div>
            <p className="text-sm text-red-600 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelCancelBooking}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmCancelBooking}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            Back
          </button>
        </div>

        {error && (
          <ErrorMessage
            message={error}
            className="mb-6"
          />
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${activeTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              Past
            </button>
          </nav>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {displayBookings.length > 0 ? (
            displayBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="px-6 py-4 bg-blue-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Booking Reference: <span className="font-medium">{booking.bookingReference}</span>
                      </h3>
                    </div>
                    <BookingStatus status={booking.status} />
                  </div>
                </div>

                {/* Flight Details */}
                <div className="px-6 py-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {booking.mainFlightType === 'RETURN' ? 'Return Flight' : 'Outbound Flight'}
                  </h4>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="text-base font-medium">{booking.flight.departureAirport?.name || booking.flight.departureAirport}</p>
                      <p className="text-base font-medium">{formatDateTime(booking.flight.departureTime)}</p>
                    </div>
                    <div className="flex-1 mx-4 border-t border-gray-300 border-dashed relative">
                      <div className="absolute inset-y-0 left-0 flex items-center justify-center w-3 h-3 -mt-1.5 rounded-full bg-blue-500" />
                      <div className="absolute inset-y-0 right-0 flex items-center justify-center w-3 h-3 -mt-1.5 rounded-full bg-blue-500" />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">To</p>
                      <p className="text-base font-medium">{booking.flight.arrivalAirport?.name || booking.flight.destinationAirport}</p>
                      <p className="text-base font-medium">{formatDateTime(booking.flight.arrivalTime)}</p>
                    </div>
                  </div>
                </div>

                {/* Return Flight Details */}
                {booking.returnFlight && (
                  <div className="px-6 py-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Return Flight</h4>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">From</p>
                        <p className="text-base font-medium">{booking.returnFlight.departureAirport?.name || booking.returnFlight.departureAirport}</p>
                        <p className="text-base font-medium">{formatDateTime(booking.returnFlight.departureTime)}</p>
                      </div>
                      <div className="flex-1 mx-4 border-t border-gray-300 border-dashed relative">
                        <div className="absolute inset-y-0 left-0 flex items-center justify-center w-3 h-3 -mt-1.5 rounded-full bg-blue-500" />
                        <div className="absolute inset-y-0 right-0 flex items-center justify-center w-3 h-3 -mt-1.5 rounded-full bg-blue-500" />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">To</p>
                        <p className="text-base font-medium">{booking.returnFlight.arrivalAirport?.name || booking.returnFlight.destinationAirport}</p>
                        <p className="text-base font-medium">{formatDateTime(booking.returnFlight.arrivalTime)}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <p>Passengers: {booking.numberOfPassengers}</p>
                      <p className="font-medium text-gray-900">{formatPrice(booking.totalPrice)}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      {activeTab === 'upcoming' && booking.status.toLowerCase() === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          disabled={cancellingBookingId === booking.id}
                          className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
                        >
                          {cancellingBookingId === booking.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            'Cancel Booking'
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/bookings/${booking.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <img
                  src="/airplane.svg"
                  alt="No bookings"
                  className="w-24 h-24 mx-auto mb-4 opacity-50"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} bookings
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'upcoming'
                    ? "You don't have any upcoming flights. Start planning your next adventure!"
                    : "You haven't completed any flights yet. Your travel history will appear here."}
                </p>
                {activeTab === 'upcoming' && (
                  <button
                    onClick={() => navigate('/')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Search Flights
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookingsPage;
