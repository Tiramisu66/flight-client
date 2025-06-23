import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useBooking } from '../context/BookingContext';
import { useAuth } from '../context/AuthContext';
import { getUserPassengers } from '../services/passengerApi';
import FlightCard from '../components/FlightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatPrice } from '../utils/formatPrice';

const BookingReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { selectedOutboundFlight, selectedReturnFlight, createNewBooking, calculateTotalPrice } = useBooking();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedPassengers, setSavedPassengers] = useState([]);
  const [selectedPassengerIds, setSelectedPassengerIds] = useState([]);

  // 加载保存的乘客信息
  useEffect(() => {
    const loadSavedPassengers = async () => {
      if (isAuthenticated) {
        try {
          const response = await getUserPassengers();
          console.log('Loaded passengers:', response); // 添加调试日志
          const passengers = response.data || [];
          if (Array.isArray(passengers)) {
            setSavedPassengers(passengers);
            // 默认选中第一个乘客
            if (passengers.length > 0) {
              setSelectedPassengerIds([passengers[0].id]);
            }
          } else {
            console.error('Invalid response format:', response);
            setError('Invalid passenger data format');
          }
        } catch (error) {
          console.error('Failed to load saved passengers:', error);
          setError('Failed to load saved passengers');
        }
      }
    };
    loadSavedPassengers();
  }, [isAuthenticated]);

  React.useEffect(() => {
    // 如果既没有选择出发航班也没有选择返程航班，才返回首页
    if (!selectedOutboundFlight && !selectedReturnFlight) {
      navigate('/');
    }
  }, [selectedOutboundFlight, selectedReturnFlight, navigate]);

  // 如果既没有选择出发航班也没有选择返程航班，不渲染页面
  if (!selectedOutboundFlight && !selectedReturnFlight) {
    return null;
  }

  // 计算价格
  const passengerCount = selectedPassengerIds.length;
  const outboundPrice = selectedOutboundFlight ? selectedOutboundFlight.price * passengerCount : 0;
  const returnPrice = selectedReturnFlight ? selectedReturnFlight.price * passengerCount : 0;
  const basePrice = outboundPrice + returnPrice;
  const taxes = basePrice * 0.1; // 10% tax
  const fees = 25 * passengerCount; // $25 per passenger service fee
  const totalPrice = basePrice + taxes + fees;

  const handlePassengerSelect = (passengerId) => {
    setSelectedPassengerIds(prev => {
      if (prev.includes(passengerId)) {
        return prev.filter(id => id !== passengerId);
      } else {
        return [...prev, passengerId];
      }
    });
  };

  const handleCancel = () => {
    const { outboundFlights = [], returnFlights = [] } = location.state || {};
    const currentSearch = window.location.search;

    navigate({
      pathname: '/search',
      search: currentSearch
    }, { 
      state: { 
        preserveSelection: true,
        selectedOutboundFlight,
        selectedReturnFlight,
        outboundFlights: outboundFlights.length > 0 ? outboundFlights : [selectedOutboundFlight],
        returnFlights: returnFlights.length > 0 ? returnFlights : (selectedReturnFlight ? [selectedReturnFlight] : []),
        searchCriteria: {
          from: searchParams.get('from'),
          to: searchParams.get('to'),
          departDate: searchParams.get('departDate'),
          returnDate: searchParams.get('returnDate'),
          passengers: searchParams.get('passengers')
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login', { 
        state: { from: '/booking/review' }
      });
      return;
    }

    // 处理航班信息
    let flightId, returnFlightId, flightType, mainFlightType;

    if (selectedOutboundFlight && selectedReturnFlight) {
      // 往返航班
      flightId = selectedOutboundFlight.id;
      returnFlightId = selectedReturnFlight.id;
      flightType = 'ROUND_TRIP';
      mainFlightType = 'OUTBOUND';
    } else if (selectedOutboundFlight) {
      // 只选择出发航班
      flightId = selectedOutboundFlight.id;
      returnFlightId = null;
      flightType = 'ONE_WAY';
      mainFlightType = 'OUTBOUND';
    } else {
      // 只选择返程航班
      flightId = selectedReturnFlight.id;
      returnFlightId = null;
      flightType = 'ONE_WAY';
      mainFlightType = 'RETURN';
    }

    // 如果没有选择乘客，不允许继续
    if (selectedPassengerIds.length === 0) {
      setError('Please select at least one passenger');
      return;
    }

    const bookingData = {
      flightId,
      returnFlightId,
      passengerIds: selectedPassengerIds,
      numberOfPassengers: selectedPassengerIds.length,
      totalPrice: totalPrice,
      flightType,
      mainFlightType
    };

    // 调试信息
    console.log('Booking data:', bookingData);
    console.log('Selected outbound flight:', selectedOutboundFlight);
    console.log('Selected return flight:', selectedReturnFlight);
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));

    navigate('/payment');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Review Your Booking</h1>

        {error && (
          <ErrorMessage
            message={error}
            className="mb-6"
          />
        )}

        <div className="mb-8 space-y-6">
          {selectedOutboundFlight && (
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <span className="text-blue-600 mr-2">✈</span>
                Outbound Flight
              </h2>
              <div className="max-w-3xl mx-auto">
                <FlightCard
                  flight={selectedOutboundFlight}
                  onSelect={() => {}}
                  selected={true}
                />
              </div>
            </div>
          )}

          {selectedReturnFlight && (
            <div className="bg-white rounded-lg shadow-md p-6 w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                <span className="text-blue-600 mr-2">✈</span>
                Return Flight
              </h2>
              <div className="max-w-3xl mx-auto">
                <FlightCard
                  flight={selectedReturnFlight}
                  onSelect={() => {}}
                  selected={true}
                />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="text-blue-600 mr-2">👤</span>
              Select Passengers
            </h2>

            <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              To add new passengers, please visit the{' '}
              <button
                type="button"
                onClick={() => navigate('/passengers')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Passenger Management
              </button>{' '}
              page.
            </div>

            {savedPassengers.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-500">No saved passengers found.</p>
                <button
                  type="button"
                  onClick={() => navigate('/passengers')}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Add Passengers
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {savedPassengers.map((passenger) => (
                  <div
                    key={passenger.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedPassengerIds.includes(passenger.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handlePassengerSelect(passenger.id)}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedPassengerIds.includes(passenger.id)}
                        onChange={() => handlePassengerSelect(passenger.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="ml-3">
                        <p className="font-medium">
                          {passenger.firstName} {passenger.lastName}
                          {passenger.isDefault && (
                            <span className="ml-2 text-sm text-blue-600">(Default)</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-500">{passenger.email}</p>
                        {passenger.phone && (
                          <p className="text-sm text-gray-500">{passenger.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedPassengerIds.length === 0 && (
              <p className="text-red-500 mt-4">
                Please select at least one passenger to continue.
              </p>
            )}
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <span className="text-blue-600 mr-2">💰</span>
              Price Summary
            </h2>
            <div className="space-y-4">
              <div>
                {/* 价格明细 */}
                {selectedOutboundFlight && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Outbound Flight</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Base Price ({selectedPassengerIds.length} passengers)</span>
                        <span>{formatPrice((selectedOutboundFlight.price || 0) * selectedPassengerIds.length)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxes (10%)</span>
                        <span>{formatPrice((selectedOutboundFlight.price || 0) * selectedPassengerIds.length * 0.1)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedReturnFlight && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-700 mb-2">Return Flight</h3>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Base Price ({selectedPassengerIds.length} passengers)</span>
                        <span>{formatPrice((selectedReturnFlight.price || 0) * selectedPassengerIds.length)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxes (10%)</span>
                        <span>{formatPrice((selectedReturnFlight.price || 0) * selectedPassengerIds.length * 0.1)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex justify-between text-sm">
                        <span>Service Fees ({selectedPassengerIds.length} × $25)</span>
                        <span>{formatPrice(fees)}</span>
                </div>
              </div>

              <div className="border-t pt-3 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={selectedPassengerIds.length === 0}
              className={`px-6 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center ${
                selectedPassengerIds.length === 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } text-white`}
            >
              <span>Continue to Payment</span>
              <span className="ml-2">→</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingReviewPage;
