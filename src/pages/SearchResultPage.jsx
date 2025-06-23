import React, { useState, useEffect } from 'react';
import { transformFlights } from '../utils/transformFlightData';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { searchFlights } from '../services/flightApi';
import FlightCard from '../components/FlightCard';
import FlightSearchForm from '../components/FlightSearchForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useBooking } from '../context/BookingContext';
import { formatDate } from '../utils/formatDate';
import { RadioGroup } from '@headlessui/react';

// 错误信息映射
const ERROR_MESSAGES = {
  NO_CRITERIA: 'Please provide departure and arrival airports, and travel dates.',
  INVALID_FORMAT: 'Received invalid data format from server.',
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.'
};

const SearchResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectOutboundFlight, selectReturnFlight } = useBooking();
  
  const [outboundFlights, setOutboundFlights] = useState([]);
  const [returnFlights, setReturnFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOutboundId, setSelectedOutboundId] = useState(null);
  const [selectedReturnId, setSelectedReturnId] = useState(null);
  const [sortBy, setSortBy] = useState('price');
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  // 从 URL 参数中获取搜索条件
  const searchCriteria = {
    from: searchParams.get('from'),
    to: searchParams.get('to'),
    departDate: searchParams.get('departDate'),
    returnDate: searchParams.get('returnDate'),
    passengers: parseInt(searchParams.get('passengers') || '1', 10),
    tripType: searchParams.get('tripType')
  };

  const loadFlights = async () => {
    // 获取当前URL中的最新参数
    const params = new URLSearchParams(window.location.search);
    const currentCriteria = {
      from: params.get('from'),
      to: params.get('to'),
      departDate: params.get('departDate'),
      returnDate: params.get('returnDate'),
      passengers: parseInt(params.get('passengers') || '1', 10),
      tripType: params.get('tripType')
    };

    if (!currentCriteria.from ||
        !currentCriteria.to ||
        !currentCriteria.departDate ||
        (currentCriteria.tripType === 'roundTrip' && !currentCriteria.returnDate)) {
      setError(ERROR_MESSAGES.NO_CRITERIA);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch outbound flights
      const outboundResponse = await searchFlights({
        ...currentCriteria,
        returnDate: null
      });
      
      if (!outboundResponse || !Array.isArray(outboundResponse)) {
        throw new Error(ERROR_MESSAGES.INVALID_FORMAT);
      }
      
      const transformedOutbound = transformFlights(outboundResponse);
      setOutboundFlights(transformedOutbound);
      
      let returnResponse = null;
      if (currentCriteria.tripType === 'roundTrip') {
        returnResponse = await searchFlights({
          from: currentCriteria.to,
          to: currentCriteria.from,
          departDate: currentCriteria.returnDate,
          passengers: currentCriteria.passengers
        });
        
        if (returnResponse && !Array.isArray(returnResponse)) {
          throw new Error(ERROR_MESSAGES.INVALID_FORMAT);
        }
      }
      
      const transformedReturn = transformFlights(returnResponse);
      setReturnFlights(transformedReturn);
    } catch (err) {
      console.error('Error loading flights:', err);
      const errorMessage = err.message === ERROR_MESSAGES.INVALID_FORMAT
        ? ERROR_MESSAGES.INVALID_FORMAT
        : err.name === 'NetworkError'
          ? ERROR_MESSAGES.NETWORK_ERROR
          : err.response?.status === 500
            ? ERROR_MESSAGES.SERVER_ERROR
            : ERROR_MESSAGES.UNKNOWN;
      
      setError(errorMessage);
    } finally {
      setLoading(false);
      setInitialLoadDone(true);
    }
  };

  // 初始加载航班信息
  useEffect(() => {
    if (!initialLoadDone && !location.state?.preserveSelection) {
      loadFlights();
    }
  }, [initialLoadDone, location.state?.preserveSelection]);

  // 恢复选择状态和航班列表
  useEffect(() => {
    if (location.state?.preserveSelection) {
      const { 
        selectedOutboundFlight, 
        selectedReturnFlight,
        outboundFlights: savedOutboundFlights,
        returnFlights: savedReturnFlights
      } = location.state;
      
      // 设置航班列表
      if (savedOutboundFlights && savedOutboundFlights.length > 0) {
        setOutboundFlights(savedOutboundFlights);
      }
      if (selectedOutboundFlight) {
        setSelectedOutboundId(String(selectedOutboundFlight.id));
        selectOutboundFlight(selectedOutboundFlight);
      }
      
      if (savedReturnFlights && savedReturnFlights.length > 0) {
        setReturnFlights(savedReturnFlights);
      }
      if (selectedReturnFlight) {
        setSelectedReturnId(String(selectedReturnFlight.id));
        selectReturnFlight(selectedReturnFlight);
      }
      
      setInitialLoadDone(true);
      setLoading(false);
    }
  }, [location.state, selectOutboundFlight, selectReturnFlight]);

  // 处理航班选择
  const handleOutboundSelect = (flight) => {
    setSelectedOutboundId(flight.id);
    selectOutboundFlight(flight);
  };

  const handleReturnSelect = (flight) => {
    setSelectedReturnId(flight.id);
    selectReturnFlight(flight);
  };

  // Sort flights
  const sortFlights = (flights) => {
    return [...flights].sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'duration':
          return a.duration - b.duration;
        case 'departure':
          return new Date(a.departureTime) - new Date(b.departureTime);
        default:
          return 0;
      }
    });
  };

  // 处理Review按钮点击
  const handleReviewClick = () => {
    if (!selectedOutboundId && !selectedReturnId) {
      return;
    }

    // 保持当前的URL参数
    const currentSearch = window.location.search;
    
    // 获取已排序的航班列表
    const sortedOutboundFlights = sortFlights(outboundFlights);
    const sortedReturnFlights = sortFlights(returnFlights);
    
    // 导航到Review页面时，传递完整的航班信息
    navigate({
      pathname: '/booking/review',
      search: currentSearch
    }, {
      state: {
        outboundFlights: sortedOutboundFlights,
        returnFlights: sortedReturnFlights,
        selectedOutboundFlight: selectedOutboundId ? outboundFlights.find(f => f.id === selectedOutboundId) : null,
        selectedReturnFlight: selectedReturnId ? returnFlights.find(f => f.id === selectedReturnId) : null,
        searchCriteria: {
          from: searchParams.get('from'),
          to: searchParams.get('to'),
          departDate: searchParams.get('departDate'),
          returnDate: searchParams.get('returnDate'),
          passengers: searchParams.get('passengers'),
          roundTrip: searchParams.get('roundTrip')
        }
      }
    });
  };

  const sortedOutboundFlights = sortFlights(outboundFlights);
  const sortedReturnFlights = sortFlights(returnFlights);

  if (loading && !location.state?.preserveSelection) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* 搜索表单 */}
        <div className="mb-8">
          <FlightSearchForm className="shadow-lg" onSearch={loadFlights} />
        </div>

        {error && (
          <div className="mb-8">
            <ErrorMessage
              message={error}
              className="rounded-lg border-l-4 border-red-500 bg-red-50 p-4"
            />
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-8">
          {/* Outbound Flights */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Outbound Flight
              </h2>
              <p className="text-gray-600">
                {searchCriteria.from} to {searchCriteria.to} on{' '}
                {formatDate(searchCriteria.departDate)}
              </p>
            </div>

            {/* Sort Options */}
            {sortedOutboundFlights.length > 0 && (
              <div className="mb-6 flex items-center space-x-4">
                <span className="text-gray-700">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="price">Price</option>
                  <option value="duration">Duration</option>
                  <option value="departure">Departure Time</option>
                </select>
              </div>
            )}

            {/* Outbound Flights List */}
            {sortedOutboundFlights.length > 0 ? (
              <div className="space-y-4">
                <RadioGroup value={selectedOutboundId} onChange={(value) => {
                  setSelectedOutboundId(value);
                  if (!value) {
                    selectOutboundFlight(null);
                  }
                }}>
                  <RadioGroup.Label>Select outbound flight</RadioGroup.Label>
                  <div className="space-y-4">
                    {sortedOutboundFlights.map((flight) => (
                      <RadioGroup.Option key={String(flight.id)} value={String(flight.id)} className="w-full">
                        {({ checked }) => (
                          <FlightCard
                            flight={{ ...flight, id: String(flight.id) }}
                            selected={checked}
                            onSelect={() => handleOutboundSelect(flight)}
                          />
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No return flights found.</p>
              </div>
            )}

          </div>

          {/* Return Flights */}
          {searchCriteria.tripType === 'roundTrip' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Return Flight
                </h2>
                {searchCriteria.returnDate && (
                  <p className="text-gray-600">
                    {searchCriteria.to} to {searchCriteria.from} on{' '}
                    {formatDate(searchCriteria.returnDate)}
                  </p>
                )}
              </div>

              {searchCriteria.returnDate ? (
                <div className="space-y-4">
                  {sortedReturnFlights.length > 0 ? (
                    <RadioGroup value={selectedReturnId} onChange={setSelectedReturnId}>
                      <RadioGroup.Label>Select return flight</RadioGroup.Label>
                      <div className="space-y-4">
                      {sortedReturnFlights.map((flight) => (
                        <RadioGroup.Option key={String(flight.id)} value={String(flight.id)} className="w-full">
                          {({ checked }) => (
                            <FlightCard
                              flight={{ ...flight, id: String(flight.id) }}
                              selected={checked}
                              onSelect={() => handleReturnSelect(flight)}
                            />
                          )}
                        </RadioGroup.Option>
                      ))}
                      </div>
                    </RadioGroup>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No return flights found.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No return flight selected.</p>
                </div>
              )}
            </div>
          )}

          {/* Review Button */}
          <div className="flex justify-end">
            <button
              onClick={handleReviewClick}
              disabled={!selectedOutboundId && !selectedReturnId}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Review Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResultPage;
