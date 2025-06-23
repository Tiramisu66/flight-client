import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBooking } from '../context/BookingContext';
import { createBooking } from '../services/bookingApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

function BookingReviewPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { selectedFlight } = useBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    passengers: 1,
    seatClass: 'economy'
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!selectedFlight) {
      navigate('/');
    }
  }, [isAuthenticated, navigate, selectedFlight]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBookingDetails((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const bookingData = {
        flightId: selectedFlight.id,
        passengers: [
          {
            firstName: bookingDetails.firstName,
            lastName: bookingDetails.lastName,
            email: bookingDetails.email,
            phone: bookingDetails.phone
          }
        ],
        seatClass: bookingDetails.seatClass
      };

      const response = await createBooking(bookingData);
      console.log('Booking created:', response.data);
      setSuccess(true);
      
      // 重置预订状态
      // setSelectedFlight(null);
    } catch (err) {
      setError(err.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fa fa-check text-green-500 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold mb-2">Booking Successful!</h2>
          <p className="text-gray-600 mb-6">Thank you for your booking. Your booking reference is: <span className="font-bold">ABC1234</span></p>
          <p className="text-gray-600 mb-8">We have sent the booking details to your email address.</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            onClick={() => navigate('/my-bookings')}
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  if (!selectedFlight) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <i className="fa fa-exclamation-circle text-4xl text-gray-300 mb-4"></i>
          <h3 className="text-xl font-bold mb-2">No flight selected</h3>
          <p className="text-gray-600 mb-6">Please select a flight to continue with your booking.</p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors"
            onClick={() => navigate('/')}
          >
            Search Flights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-2/3">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold">Flight Details</h3>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedFlight.airline.name}</h2>
                  <p className="text-gray-600">{selectedFlight.flightNumber}</p>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedFlight.type}
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-2xl font-bold">{selectedFlight.departure.city}</p>
                  <p className="text-lg">{selectedFlight.departure.airportName}</p>
                  <p className="text-xl font-medium mt-2">{selectedFlight.departureTime}</p>
                  <p className="text-gray-500">{selectedFlight.departureDate}</p>
                </div>
                
                <div className="flex flex-col items-center mx-4">
                  <div className="h-1 w-24 bg-gray-300 relative">
                    <div className="absolute -top-2 left-0 h-5 w-5 bg-blue-500 rounded-full"></div>
                    <div className="absolute -top-2 right-0 h-5 w-5 bg-gray-300 rounded-full"></div>
                  </div>
                  <p className="mt-2 text-gray-600">
                    <i className="fa fa-clock-o mr-1"></i> {selectedFlight.duration}h
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedFlight.stops > 0 ? `${selectedFlight.stops} stop${selectedFlight.stops > 1 ? 's' : ''}` : 'Non-stop'}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold">{selectedFlight.arrival.city}</p>
                  <p className="text-lg">{selectedFlight.arrival.airportName}</p>
                  <p className="text-xl font-medium mt-2">{selectedFlight.arrivalTime}</p>
                  <p className="text-gray-500">{selectedFlight.arrivalDate}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold">Passenger Information</h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-gray-700 font-medium mb-2">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={bookingDetails.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-gray-700 font-medium mb-2">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={bookingDetails.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={bookingDetails.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-gray-700 font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={bookingDetails.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 font-medium mb-2">Seat Class</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="seatClass"
                          value="economy"
                          checked={bookingDetails.seatClass === 'economy'}
                          onChange={handleChange}
                          className="form-radio h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2">Economy</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="seatClass"
                          value="business"
                          checked={bookingDetails.seatClass === 'business'}
                          onChange={handleChange}
                          className="form-radio h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2">Business</span>
                      </label>
                    </div>
                    <div>
                      <label className="flex items-center p-3 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="seatClass"
                          value="first"
                          checked={bookingDetails.seatClass === 'first'}
                          onChange={handleChange}
                          className="form-radio h-5 w-5 text-blue-600"
                        />
                        <span className="ml-2">First Class</span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div className="md:w-1/3">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden sticky top-6">
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <h3 className="font-bold">Price Summary</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare ({bookingDetails.passengers} passenger{bookingDetails.passengers > 1 ? 's' : ''})</span>
                  <span>${selectedFlight.price * bookingDetails.passengers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Fees</span>
                  <span>${selectedFlight.taxes * bookingDetails.passengers}</span>
                </div>
                {bookingDetails.seatClass === 'business' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business Class Surcharge</span>
                    <span>${selectedFlight.businessClassSurcharge * bookingDetails.passengers}</span>
                  </div>
                )}
                {bookingDetails.seatClass === 'first' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">First Class Surcharge</span>
                    <span>${selectedFlight.firstClassSurcharge * bookingDetails.passengers}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-xl">${selectedFlight.totalPrice * bookingDetails.passengers}</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Payment Method</h4>
                <div className="flex items-center">
                  <i className="fa fa-credit-card text-blue-500 text-xl mr-3"></i>
                  <span>Credit/Debit Card</span>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-500">
                <p>By completing your booking, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingReviewPage;    